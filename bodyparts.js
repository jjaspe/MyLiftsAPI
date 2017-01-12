var BODYPARTS_COLLECTION = "Bodyparts";

(function () {  
    var bodypartService = require('./bodypart.service');
    var exerciseService = require('./exercise.service');
        
    var mapBodyPart = function (bp,exData){
        bp.exercises=bp.exercises.map(exId=>exData.find(n=>n._id.equals(exId)));
        bp.Id=bp._id;
        return bp;
    }
    
    module.exports.getBodyParts = function (req, res) {
        exerciseService.getExercises((exErr,exData)=>{
            if(exErr){
                handleResponse(err,"Error getting exercises",null,res);
            }else{
                bodypartService.getBodyParts((err,data)=>{
                    if(err){
                        handleResponse(err,"Error getting bodyparts",null,res);
                    }else{
                        if(data && data.length>0)
                        {
                            data.forEach(bp=>mapBodyPart(bp,exData));
                            handleResponse(err,"",data,res);
                        }
                        else
                            handleResponse(err,"",data,res);
                    }
                })
            }
        })        
    }

    module.exports.postBodypart = function (req, res) {
        if (!(req.body.Name)) {
            handleResponse("Invalid user input ", "Must provide a Name", null,res);
        }
        bodypartService.postBodypart( req.body,(err,data)=>
                                       handleResponse(err,'Failed to update bodypart',data,res)
                                    );        
    }

    module.exports.updateBodypartExercises = function (db, bodypartId, exerciseId) {
       return bodypartService.updateBodypart(bodypartId,exerciseId,(a)=>console.log("Updated BodypartExercise:"+a));
    }
    
    var handleResponse = function (err, errorMessage, data, res) {
        if (err) {
            console.log("ERROR: " + err);
            res.status(code || 500).json({ "error": err+errorMessage });
        } else {
            res.status(200).json(data);
        }
    }
} ());