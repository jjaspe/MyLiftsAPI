var BODYPARTS_COLLECTION = "Bodyparts";

(function () {    
    var mongodb = require("mongodb");
    var ObjectID = mongodb.ObjectID;
    var dbConnection=require('./dbConnection');    
    dbConnection.db(
        (database)=>{db=database}
        );
        
    var getBodyParts = function (req, res) {
        db.collection(BODYPARTS_COLLECTION).find({}).toArray(function (err, docs) {
            if (err) {
                handleError(res, err.message, "Failed to get bodyparts.");
            } else {
                res.status(200).json(docs);
            }
        })
    }

    var postBodypart = function (req, res) {
        if (!(req.body.Name)) {
            handleError(res, "Invalid user input ", "Must provide a Name", 400);
        }

        db.collection(BODYPARTS_COLLECTION).find({ Name: req.body.Name }).toArray(function (err, docs) {
            if (err) {
                handleError(res, err.message, "Failed to get Bodypart.");
            } else {
                var Bodypart = docs[0];
                if (Bodypart) {
                    var updateDoc = req.body;
                    updateDoc.LastModified = new Date();
                    updateDoc.exercises = updateDoc.exercises.map(a => a.Id);
                    db.collection(BODYPARTS_COLLECTION).updateOne({ Name: req.params.Name }, updateDoc, function (err, doc) {
                        if (err) {
                            handleError(res, err.message, "Failed to update bodypart");
                        } else {
                            res.status(201).json(doc)
                        }
                    });
                } else {
                    var newBodypart = req.body;
                    newBodypart.Created = new Date();
                    newBodypart.LastModified = new Date();
                    if(newBodypart.exercises)
                        newBodypart.exercises = newBodypart.exercises.map(a => a.Id);
                    else
                        newBodypart.exercises=[];
                    db.collection(BODYPARTS_COLLECTION).insertOne(newBodypart, function (err, doc) {
                        if (err) {
                            handleError(res, err.message, "Failed to create new bodypart.");
                        } else {
                            res.status(201).json(doc.ops[0]);
                        }
                    });
                }
            }
        });
    }

    var updateBodypartExercises = function (db, bodypartId, exerciseId) {
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
    
    module.exports.getBodyParts = function (req, res) {
                return getBodyParts(req, res);
            }

    module.exports.postBodypart = function (req, res) {
                return postBodypart(req, res);
            }
            
    module.exports.updateBodypartExercises = function (db, bodypartId, exerciseId){
        return updateBodypartExercises(db,bodypartId,exerciseId);
    }
} ());