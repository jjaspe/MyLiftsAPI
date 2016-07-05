var SETS_COLLECTION = "Sets";

(function () {
    handleError = require('./common');
    var mongodb = require("mongodb");
    var ObjectID = mongodb.ObjectID;

    var getSets = function (req, res, db) {
        db.collection(SETS_COLLECTION).find({}).toArray(function (err, docs) {
            if (err) {
                handleError(res, err.message, "Failed to get sets.");
            } else {
                res.status(200).json(docs);
            }
        })
    }

    var getSetsByWorkout = function (req, res, db, workoutId) {
        db.collection(SETS_COLLECTION).find({}).toArray(function (err, docs) {
            if (err) {
                handleError(res, err.message, "Failed to get sets.");
            } else {
                var workoutSets = docs.filter(a => a.workoutId == workoutId);
                res.status(200).json(workoutSets);
            }
        })
    }

    var saveSet = function (set, res, db) {
        db.collection(SETS_COLLECTION).find({ _id: new ObjectID(set._id) }).toArray(function (err, docs) {
            if (err) {
                handleError(res, err.message, "Failed to get Workout.");
            } else {
                var existingSet = docs[0];
                if (existingSet) {
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

    var postSet = function (req, res, db) {
        db.collection(SETS_COLLECTION).find({ Date: req.body.Date, UserId: req.body.UserId }).toArray(function (err, docs) {
            if (err) {
                handleError(res, err.message, "Failed to get Workout.");
            } else {
                var Workout = docs[0];
                if (Workout) {
                    var updateDoc = CreateWorkout(req);
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
} ());