(function () {
    handleError=require('./common');
    setsService = require ('./set.service');
    workoutService = require ('./workout.service');
    
    var getWorkouts = function (req, res) {
        workoutService.getWorkouts(function(err,workouts){
            if (err) {
                handleError(res, err, "Failed to get workouts.");
            } else {
                workouts.forEach((w,i,array)=>setsService.getSetsByWorkout(w._id,(err,sets)=>{
                    w.Sets=sets;
                    if(i==array.length-1)
                        res.status(200).json(workouts);
                }));                
            }
        });
    }
    
    var getWorkoutsByUser = function (req, res,userId){
        workoutService.getWorkoutsByUser(userId,function(err,data){
            if (err) {
                handleError(res, err, "Failed to get workouts for userId:" + userId);
            } else {
                res.status(200).json(data);
            }
        });
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

    var ResetSetAndSetGroups = function (workout) {
        workout.setGroups = undefined;
        workout.sets = undefined;
    }
    
    var CreateWorkout = function (workout){
        ResetSetAndSetGroups(workout);
        workout.LastModified = new Date();
        return workout;
    }
    
    var postWorkout = function (req, res) {
        var workout=req.body;
        var sets=GetSetsFromWorkout(workout);
        ResetSetAndSetGroups(workout);
        workoutService.saveWorkout(workout,function(err,data){
             if (err) {
                handleError(res, err, "Failed to get workouts.");
            } else {  
                sets.forEach(a=>a.WorkoutId=data._id);              
                sets.forEach(set=>setsService.saveSet(set,(err,data)=>{
                    if(err)
                        console.log(err);
                }));
                res.status(201).json(data);
            }
        })
    }
    
    module.exports.getWorkoutsByUser = getWorkoutsByUser;
    
    module.exports.getWorkouts = getWorkouts;

    module.exports.postWorkout = postWorkout;
}());