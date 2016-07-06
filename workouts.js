var WORKOUTS_COLLECTION = "Workouts";

(function () {
    handleError=require('./common');
    setsService = require ('./sets');
    var dbConnection=require('./dbConnection');    
    dbConnection.db(
        (database)=>{db=database}
        );
    
    var getWorkouts = function (req, res) {
        db.collection(WORKOUTS_COLLECTION).find({}).toArray(function (err, docs) {
            if (err) {
                handleError(res, err.message, "Failed to get workouts.");
            } else {
                res.status(200).json(docs);
            }
        })
    }
    
    var getWorkoutsByUser = function (req, res,userId){
        db.collection(WORKOUTS_COLLECTION).find({}).toArray(function (err, docs) {
            if (err) {
                handleError(res, err.message, "Failed to get workouts.");
            } else {
                var userWorkouts=docs.filter(a=>a.userId==userId);
                res.status(200).json(userWorkouts);
            }
        })
    }
    
    var GetSetsFromWorkout = function (workout){
        return GetSetsFromSetGroups(workout.setGroups);
    }
    
    var GetSetsFromSetGroups = function(setGroups){
        var sets=[];
        setGroups.forEach(a=>{
            a.Sets.forEach(b=>{
                b.ExerciseId=a.Exercise._id;
                sets.push(b);
            })
        })
        return sets;
    }

    var SetWorkoutSets = function (workout) {
        var sets = [];
        if (workout.setGroups) {
            sets = GetSetsFromSetGroups(workout.setGroups)
        }
        workout.setGroups = null;
        workout.sets = sets.map(a=>a._id);
    }
    
    var CreateWorkout = function (json,res){
        var workout=json;
        SetWorkoutSets(workout);
        workout.LastModified = new Date();
        return workout;
    }
    
    var postWorkout = function (req, res) {
        var Workout;
        db.collection(WORKOUTS_COLLECTION).find({ Date: req.body.Date, UserId:req.body.UserId }).toArray(function (err, docs) {
            if (err) {
                handleError(res, err.message, "Failed to get Workout.");
            } else {
                Workout = docs[0];
                var sets=GetSetsFromWorkout(req.body);
                if (Workout) {                    
                    var updateDoc = CreateWorkout(req.body,res);                    
                    db.collection(WORKOUTS_COLLECTION).updateOne({ Name: req.body.Name }, updateDoc, function (err, doc) {
                        if (err) {
                            handleError(res, err.message, "Failed to update Workout");
                        } else {
                            console.log(sets);
                            sets.forEach(a=>setsService.saveSet(a,res));
                            res.status(201).json(doc)
                        }
                    });
                    
                } else {
                    Workout = CreateWorkout(req.body,res)
                    Workout.Created = new Date();
                    db.collection(WORKOUTS_COLLECTION).insertOne(Workout, function (err, doc) {
                        if (err) {
                            handleError(res, err.message, "Failed to create new Workout.");
                        } else {
                            console.log(sets);
                            sets.forEach(a=>setsService.saveSet(a,res));
                            res.status(201).json(doc.ops[0]);
                        }
                    });
                }
            }
        });
    }
    
    module.exports.getWorkoutsByUser = getWorkoutsByUser;
    
    module.exports.getWorkouts = getWorkouts;

    module.exports.postWorkout = postWorkout;
}());