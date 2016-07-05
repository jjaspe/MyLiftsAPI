var WORKOUTS_COLLECTION = "Workouts";

(function () {
    handleError=require('./common');
    setsService = require ('./sets');
    
    var getWorkouts = function (req, res, db) {
        db.collection(WORKOUTS_COLLECTION).find({}).toArray(function (err, docs) {
            if (err) {
                handleError(res, err.message, "Failed to get workouts.");
            } else {
                res.status(200).json(docs);
            }
        })
    }
    
    var getWorkoutsByUser = function (req, res, db, userId){
        db.collection(WORKOUTS_COLLECTION).find({}).toArray(function (err, docs) {
            if (err) {
                handleError(res, err.message, "Failed to get workouts.");
            } else {
                var userWorkouts=docs.filter(a=>a.userId==userId);
                res.status(200).json(userWorkouts);
            }
        })
    }
    
    var GetSetsFromSetGroups = function(setGroups){
        var sets=[];
        setGroups.forEach(a=>{
            a.Sets.forEach(b=>{
                b.ExerciseId=a.Exercise._id;
                b.workout
                sets.push(b);
            })
        })
        return sets;
    }

    var SetWorkoutSets = function (workout) {
        var sets = [];
        if (workout.setGroups) {
            sets = GetSetsFromSetGroups(workout.setGroups)
            sets.forEach(a=>a.workoutId=workout._id);
        }
        workout.setGroups = null;
        workout.sets = sets.map(a => a._id);
    }
    
    var CreateWorkout = function (json){
        var workout=json;
        SetWorkoutSets(workout);
        workout.LastModified = new Date();
        return workout;
    }
    
    
    var postWorkout = function (req, res, db) {
        db.collection(WORKOUTS_COLLECTION).find({ Date: req.body.Date, UserId:req.body.UserId }).toArray(function (err, docs) {
            if (err) {
                handleError(res, err.message, "Failed to get Workout.");
            } else {
                var Workout = docs[0];
                if (Workout) {
                    var updateDoc = CreateWorkout(req.body);                    
                    db.collection(WORKOUTS_COLLECTION).updateOne({ Name: req.body.Name }, updateDoc, function (err, doc) {
                        if (err) {
                            handleError(res, err.message, "Failed to update Workout");
                        } else {
                            res.status(201).json(doc)
                        }
                    });
                } else {
                    var newWorkout = CreateWorkout(req.body)
                    newWorkout.Created = new Date();
                    db.collection(WORKOUTS_COLLECTION).insertOne(newWorkout, function (err, doc) {
                        if (err) {
                            handleError(res, err.message, "Failed to create new Workout.");
                        } else {
                            res.status(201).json(doc.ops[0]);
                        }
                    });
                }
            }
        });
    }
    
    module.exports.getWorkoutsByUser = function (req,res,db,userId){
        return getWorkoutsByUser(req,res,db,userId);
    }
    
    module.exports.getWorkouts = function (req, res, db) {
        return getWorkouts(req, res, db);
    }

    module.exports.postWorkout = function (req, res, db) {
        return postWorkout(req, res, db);
    }
}());