var EXERCISES_COLLECTION = "Exercises";

(function () {
    var bodypartsService = require("./bodyparts");
    var dbConnection = require('./dbConnection');
    var mongodb = require("mongodb");
    var ObjectID = mongodb.ObjectID;
    dbConnection.db((database) => { db = database });

    module.exports.getExerciseById = function (id, callback) {
        db.collection(EXERCISES_COLLECTION).find({ _id: new ObjectID(id) }).toArray((err, data) =>
            handleResponse(err, "Error finding exercise", data[0], callback)
        );
    }

    module.exports.getExercises = function (callback) {
        db.collection(EXERCISES_COLLECTION).find({}).toArray(function (err, docs) {
            handleResponse(err, "Error getting exercises", docs, callback);
        })
    }

    var createExercise = function (req) {
        var newExercise = req.body;
        newExercise.LastModified = new Date();
        newExercise.bodyparts = newExercise.bodyparts.map(a => a.Id);
        return newExercise;
    }

    module.exports.postExercise = function (req, res) {
        if (!(req.body.Name)) {
            handleError(res, "Invalid user input ", "Must provide a Name", 400);
        }

        db.collection(EXERCISES_COLLECTION).find({ Name: req.body.Name }).toArray(function (err, docs) {
            if (err) {
                handleError(res, err.message, "Failed to get Exercise.");
            } else {
                var Exercise = docs[0];
                if (Exercise) {
                    var updateDoc = createExercise(req);
                    db.collection(EXERCISES_COLLECTION).updateOne({ Name: updateDoc.Name }, updateDoc, function (err, doc) {
                        if (err) {
                            handleError(res, err.message, "Failed to update exercise");
                        } else {
                            updateDoc.bodyparts.forEach(
                                a => bodypartsService.updateBodypartExercises(db, a, updateDoc._id))
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
                                a => bodypartsService.updateBodypartExercises(db, a, newExercise._id))
                            res.status(201).json(doc.ops[0]);
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