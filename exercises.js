var EXERCISES_COLLECTION = "Exercises";

(function () {
    var bodypartsService=require("./bodyparts");
    var dbConnection=require('./dbConnection');    
    dbConnection.db((database)=>{db=database});
    var exerciseService = require ('./exercise.service'); 

    module.exports.getExercises = function (req, res) {
        exerciseService.getExercises( (err,data) => handleResponse(err,"Error getting exercises",data,res));
    }

    var createExercise= function(req){
        var newExercise = req.body;
        newExercise.LastModified = new Date();
        if(newExercise.bodyparts)
            newExercise.bodyparts = newExercise.bodyparts.map(a => a.Id);
        else
            newExercise.bodyparts=[];
        return newExercise;
    }
    
    module.exports.postExercise = function (req, res) {
        if (!(req.body.Name)) {
            handleResponse("", "Invalid user input ,Must provide a Name", null,res);
        }
        db.collection(EXERCISES_COLLECTION).find({ Name: req.body.Name }).toArray(function (err, docs) {
            if (err) {
                handleError(res, err.message, "Failed to get Exercise.");
            } else {
                var Exercise = docs[0];
                if (Exercise) {
                    var updateDoc = createExercise(req);
                    db.collection(EXERCISES_COLLECTION).updateOne({ Name: req.body.Name }, updateDoc, function (err, doc) {
                        if (err) {
                            handleError(res, err.message, "Failed to update exercise");
                        } else {
                            updateDoc.bodyparts.forEach(
                                a=>bodypartsService.updateBodypartExercises(db,a,updateDoc._id))
                            res.status(201).json(doc)
                        }
                    });
                } else {
                    var newExercise = createExercise(req);
                    newExercise.Created = new Date();
                    db.collection(EXERCISES_COLLECTION).insertOne(newExercise, function (err, doc) {
                        if (err) {
                            handleError(res, err.message, "Failed to create new exercise.");
                        } else {
                            newExercise.bodyparts.forEach(
                                a=>bodypartsService.updateBodypartExercises(db,a,doc.ops[0]._id));
                            res.status(201).json(doc.ops[0]);
                        }
                    });
                }
            }
        });


    }
    
    var handleResponse = function (err, errorMessage, data, res) {
        if (err) {
            console.log("ERROR: " + err);
            res.status(500).json({ "error": err+errorMessage });
        } else {
            res.status(200).json(data);
        }
    }
} ());