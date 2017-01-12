var WORKOUTS_COLLECTION = "Workouts";

(function () {
    setsService = require('./set.service');
    setGroupService = require('./setGroups.service');
    var dbConnection = require('./dbConnection');
    dbConnection.db((database) => { db = database });

    var getWorkouts = function (callback) {
        db.collection(WORKOUTS_COLLECTION).find({}).toArray(function (err, docs) {
            handleResponse(err, docs, callback);
        })
    }

    var getWorkoutsByUser = function (userId, callback) {
        db.collection(WORKOUTS_COLLECTION).find({ userId: userId }).toArray(function (err, docs) {
            handleResponse(err, docs, callback);
        })
    }
    
    module.exports.saveWorkout = function (workout, callback){        
        //If workout is new, save it first to get it's id for setGroups
        //Otherwise, just update setGroups
        if(!workout.Id){
            upsertWorkout(workout , (err, savedWorkout) =>{
                if(err){
                    console.log("Error saving workout:"+{workout:workout});
                    callback(err,null);
                }else{
                    mapWorkout(savedWorkout);
                    workout=savedWorkout;
                    console.log("New Workout saved"+JSON.stringify(workout));
                    updateWorkoutSetGroups(workout,callback);
                }
            })
        }else
            updateWorkoutSetGroups(workout,callback);
        
    }
    
    var updateWorkoutSetGroups = function (workout, callback){
        var setGroups= workout.setGroups;
        setGroupService.saveSetGroups(setGroups, (err, savedSetGroups)=>{
            workout.setGroups = savedSetGroups.map(n=>n._id);
            console.log("\r\nGroups:"+JSON.stringify(savedSetGroups));
            upsertWorkout(workout , (err, savedWorkout) =>{
                if(err){
                    console.log("Error saving workout:"+{workout:workout});
                    callback(err,null);
                    //delete old setGroups
                }else{
                    console.log("\r\nSet Groups Saved"+JSON.stringify(savedSetGroups));
                    workout.setGroups=savedSetGroups;
                    callback(null,workout);
                }
            })
        })
    }
    
    var mapWorkout = function(workout){
        workout.Id=workout._id;
    }

    var upsertWorkout = function (workout, callback) {
        db.collection(WORKOUTS_COLLECTION).find({ workoutDate: workout.workoutDate, userId: workout.userId }).toArray(function (err, docs) {
            if (err) {
                handleResponse(err, null, callback);
            } else {
                if (docs[0]) {
                    workout._id=docs[0]._id;
                    db.collection(WORKOUTS_COLLECTION).updateOne({ workoutDate: workout.workoutDate, 
                        userId: workout.userId }, workout, function (err, doc) {
                        handleResponse(err, workout, callback);
                    });
                } else {                   
                    db.collection(WORKOUTS_COLLECTION).insertOne(workout, function (err, doc) {
                        handleResponse(err, doc.ops[0], callback);
                    });
                }
            }
        });
    }

    var handleResponse = function (error, data, callback) {
        if (error) {
            callback(error.message, null);
        } else {
            callback(error, data);
        }
    }

    module.exports.getWorkoutsByUser = getWorkoutsByUser;

    module.exports.getWorkouts = getWorkouts;

    
} ());