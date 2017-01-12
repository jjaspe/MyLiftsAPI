var SETS_COLLECTION = "Sets";

(function () {
    var setService = require('./set.service');
    var exerciseService = require('./exercise.service');
    
    module.exports.getSetsByWorkout = function (req, res, workoutId) {
        setService.getSetsByWorkout(workoutId, (err, data) => {
                mapSets(data,(sets)=> handleResponse(err,"Failed to get sets",sets, res)
            );
        });
    }

    var getSet = function (req, res, setId) {
        setService.getSet(id, (err, data) => {
            handleResponse(err,"Failed to get set",data, res);
        });
    }

    module.exports.getSets = function (req, res) {
        setService.getSets( (err,data) => {
            mapSets(data,(sets)=> handleResponse(err,"Failed to get sets",sets, res));
            //handleResponse(err,"Failed to get sets",data, res)
        })
    }

    module.exports.postSet = function (req, res) {
        setService.saveSet(req.body, function (err, data) {
            handleResponse(err,"Failed to save set",data, res);
        })
    }
    
    module.exports.deleteSet = function (req,res,setId) {
        setService.deleteSet(setId,(err,n)=>{
            handleResponse(err,"error deleting document",n,res);
        });
    }
    
    var mapSets = function (sets,callback){
        if(sets && sets.length>0)
        {
                sets.forEach((w,i,array)=>exerciseService.getExerciseById(w.ExerciseId,(err,ex)=>{
                w.Id=w._id;
                w.exercise=ex;
                if(i==array.length-1)
                    callback(sets);
            }));        
        }
        else
            callback(sets);        
    }
    
    var handleResponse = function (err, errorMessage, data, res) {
        if (err) {
            handleError(res, err+errorMessage);
        } else {
            res.status(200).json(data);
        }
    }
} ());