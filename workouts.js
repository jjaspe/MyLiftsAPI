(function () {
    handleError=require('./common');
    setsService = require ('./set.service');
    workoutService = require ('./workout.service');
    setGroupService = require ('./setGroups.service');
    
    module.exports.getWorkouts = function (req, res) {
        workoutService.getWorkouts(function(err,workouts){
            if (err) {
                handleError(res, err, "Failed to get workouts.");
            } else {
                 mapWorkouts(workouts,(err,workouts)=>res.status(200).json(workouts));          
            }
        });
    }
    
    module.exports.getWorkoutsByUser = function (req, res,userId){
        workoutService.getWorkoutsByUser(userId,function(err,data){
            if (err) {
                handleError(res, err, "Failed to get workouts for userId:" + userId);
            } else {            
                mapWorkouts(data,(err,workouts)=>res.status(200).json(workouts));    
            }
        });
    }
    
    module.exports.postWorkout = function (req, res) {
        var workout=req.body;     
        console.log("\r\nWorkout Posted:"+JSON.stringify(workout));
        workoutService.saveWorkout(workout, (err, savedWorkout) => {
            if(err){
                console.log("Error saving workout");
            }else{
                res.status(201).json(savedWorkout);
            }
        });
    }
    
    var updateSets = function (workout,setsInDb,callback){
        var setsInApi=workout.sets;
        console.log("Sets in API:"+setsInApi.length);
        console.log("Sets in db:"+setsInDb.length);
        //setsInApi.forEach(a=>a.workoutId=workout._id);              
        saveSets(setsInApi,(err,data) => {
            if(err){
                callback(err,null);
            }else{
                callback(null,data);
            }
        });
        deleteSetsFromDbIfNotInList(setsInApi,setsInDb);
    }
    
    var deleteSetsFromDbIfNotInList = function (sets,setsInDb){
        if(setsInDb){
            setsInDb=setsInDb.filter(b=>!sets.find(a=>a._id==b._id));
            setsService.deleteSets(setsInDb,(err,data) =>{
                if(err)
                    console.log(err);
                else
                    console.log('Deleted set:'+data);
            });
        }
    }
    
    var saveSets = function (sets,callback){
        sets.forEach( (set,index,array)=>setsService.saveSet(set,(err,data)=>{
            if(err){
                callback(err,null);
            }
            else{
                set=setsService.mapSet(data);                
            }  
            if(index==sets.length-1){
                callback(null,sets);
            }              
        }));
    }
    
    var mapWorkouts = function (workouts,callback){
        if(workouts && workouts.length>0)
        {
            workouts.forEach((w,i)=> {
                mapWorkout(w, (err,savedWorkout) => {
                    if(err){
                        console.log("Error mapping workout"+JSON.stringify(w));
                    }else{
                        w=savedWorkout;
                    }
                    if(i==workouts.length-1){
                        callback(null,workouts);
                    }
                })
            });        
        }
        else
            callback(null,workouts);        
    }
    
    var mapWorkout = function (workout, callback){
        setGroupService.getSetGroupsById(workout.setGroups,(err,setGroups)=>{
            if(err){
                console.log("Error mapping setGroup for workout"+JSON.stringify(workout));
                callback(err,null);
            }else{
                workout.setGroups=setGroups;
                callback(null,workout);
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
                b.ExerciseId=b.exercise._id;
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
    
    var handleResponse = function (err, errorMessage, data, res) {
        if (err) {
            console.log("ERROR: " + err);
            res.status(500).json({ "error": err+errorMessage });
        } else {
            res.status(200).json(data);
        }
    }
    
    var jsonLog  = function(data){
        console.log(JSON.stringify(data));
    }
}());