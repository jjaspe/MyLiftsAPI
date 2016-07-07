var SETS_COLLECTION = "Sets";

(function () {
    var mongodb = require("mongodb");
    var ObjectID = mongodb.ObjectID;
    var dbConnection = require('./dbConnection');
    dbConnection.db((database) => { db = database });

    module.exports.saveSet = function (set, callback) {
        db.collection(SETS_COLLECTION).find({ _id: new ObjectID(set._id) }).toArray(function (err, docs) {
            if (err) {
                handleResponse(err, "Failed to find set with Id:" + set._id, null, callback);
            } else {
                if (docs[0]) {
                    db.collection(SETS_COLLECTION).updateOne({ _id: new ObjectID(set._id) },
                        set, function (err, doc) {
                            handlerResponse(err, "Failed to update set with Id:" + set._id, doc, callback);
                        });
                } else {
                    set.Created = new Date();
                    db.collection(SETS_COLLECTION).insertOne(set, function (err, doc) {
                        handleResponse(err, "Failed to update create set", doc.ops[0], callback)
                    });
                }
            }
        });
    }

    module.exports.getSetsByWorkout = function (workoutId, callback) {
        db.collection(SETS_COLLECTION).find({ WorkoutId: new ObjectID(workoutId) }).toArray(function (err, docs) {
            handleResponse(err, "Failed to get sets for workout with id:" + workoutId, docs, callback);
        });
    }

    module.exports.getSet = function (id, callback) {
        db.collection(SETS_COLLECTION).find({ _id: new ObjectID(id) }).toArray(function (err, docs) {
            handleResponse(err, "Failed to get sets for with id:" + id, docs[0], callback);
        });
    }

    module.exports.getSets = function (callback) {
        db.collection(SETS_COLLECTION).find({}).toArray(function (err, docs) {
            handleResponse(err, "Failed to get sets", docs, callback);
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