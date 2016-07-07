var WORKOUTS_COLLECTION = "Workouts";

(function () {
    setsService = require('./set.service');
    var dbConnection = require('./dbConnection');
    dbConnection.db((database) => { db = database });

    var getWorkouts = function (callback) {
        db.collection(WORKOUTS_COLLECTION).find({}).toArray(function (err, docs) {
            handleResponse(err, docs, callback);
        })
    }

    var getWorkoutsByUser = function (userId, callback) {
        db.collection(WORKOUTS_COLLECTION).find({ UserId: userId }).toArray(function (err, docs) {
            handleResponse(err, docs, callback);
        })
    }

    var saveWorkout = function (workout, callback) {
        db.collection(WORKOUTS_COLLECTION).find({ Date: workout.Date, UserId: workout.UserId }).toArray(function (err, docs) {
            if (err) {
                handleResponse(err, null, callback);
            } else {
                if (docs[0]) {
                    db.collection(WORKOUTS_COLLECTION).updateOne({ Date: workout.Date, UserId: workout.UserId }, workout, function (err, doc) {
                        handleResponse(err, doc, callback);
                    });
                } else {
                    workout.Created = new Date();
                    db.collection(WORKOUTS_COLLECTION).insertOne(workout, function (err, doc) {
                        handleResponse(err, doc.ops[0], callback);
                    });
                }
            }
        });
    }

    var handleResponse = function (error, data, callback) {
        if (error) {
            callback(err.message, null);
        } else {
            callback(error, data);
        }
    }

    module.exports.getWorkoutsByUser = getWorkoutsByUser;

    module.exports.getWorkouts = getWorkouts;

    module.exports.saveWorkout = saveWorkout;
} ());