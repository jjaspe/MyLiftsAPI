var BODYPARTS_COLLECTION = "Bodyparts";

(function () {    
    var mongodb = require("mongodb");
    var ObjectID = mongodb.ObjectID;
    var dbConnection=require('./dbConnection');    
    dbConnection.db((database)=>{db=database});
        
    module.exports.getBodyParts = function (callback) {
        db.collection(BODYPARTS_COLLECTION).find({}).toArray(function (err, docs) {
            handleResponse(err,"Error getting bodyparts",docs,callback);
        })
    }

    module.exports.updateBodypart = function (bodypartId, exerciseId, callback) {
        db.collection(BODYPARTS_COLLECTION).find({ _id: new ObjectID(bodypartId) }).toArray(function (err, docs) {
            if (err) {
                handleResponse(err, "Failed to get bodypart with id:" + bodypartId,null,callback);
            } else {
                var Bodypart = docs[0];
                if (Bodypart && Bodypart.exercises.indexOf(exerciseId)==-1) {
                    Bodypart.exercises.push(exerciseId);
                    db.collection(BODYPARTS_COLLECTION).updateOne({ _id: new ObjectID(bodypartId) }, Bodypart, function (err, doc) {
                        if (err) {
                            console.log("Failed to update bodypart.exercises. BodypartId:"+bodypartId+
                                ", ExercisesId:"+exerciseId);
                        } 
                    });
                }
            }
        });
    }
    
    module.exports.postBodypart = function (bodypart, callback) {
        db.collection(BODYPARTS_COLLECTION).find({ Name: bodypart.Name}).toArray(function (err, docs) {
            if (err) {
                handleResponse(err.message, "Failed to get Bodypart.",null,callback);
            } else {
                if (docs[0]) {
                    var updateDoc = docs[0];
                    updateDoc.LastModified = new Date();
                    bodypart.exercises.forEach(ex=>updateDoc.exercises.push(ex.Id));
                    db.collection(BODYPARTS_COLLECTION).updateOne({ Name: bodypart.Name }, updateDoc, function (err, doc) {
                        handleResponse(err,"Error updating bodypart",docs,callback);
                    });
                } else {
                    var newBodypart = bodypart;
                    newBodypart.Created = new Date();
                    newBodypart.LastModified = new Date();
                    if(newBodypart.exercises)
                        newBodypart.exercises = newBodypart.exercises.map(a => a.Id);
                    else
                        newBodypart.exercises=[];
                    db.collection(BODYPARTS_COLLECTION).insertOne(newBodypart, function (err, doc) {
                        handleResponse(err,"Error creating bodypart",docs,callback);
                    });
                }
            }
        });
    }

    module.exports.updateBodypartExercises = function (db, bodypartId, exerciseId) {
        db.collection(BODYPARTS_COLLECTION).find({ _id: new ObjectID(bodypartId) }).toArray(function (err, docs) {
            if (err) {
                handleError(res, err.message, "Failed to get bodypart with id:" + bodypartId);
            } else {
                var Bodypart = docs[0];
                if (Bodypart && Bodypart.exercises.indexOf(exerciseId)==-1) {
                    Bodypart.exercises.push(exerciseId);
                    db.collection(BODYPARTS_COLLECTION).updateOne({ _id: new ObjectID(bodypartId) }, Bodypart, function (err, doc) {
                        if (err) {
                            console.log("Failed to update bodypart.exercises. BodypartId:"+bodypartId+
                                ", ExercisesId:"+exerciseId);
                        } 
                    });
                }
            }
        });
    }
    
    var handleResponse = function (error, errorMessage, data, callback) {
        if (error) {
            callback(errorMessage + "\r\n" + err.message, null);
        } else {
            callback(error, data);
        }
    }
} ());