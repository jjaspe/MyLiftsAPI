var SETS_COLLECTION = "Sets";

(function () {
    handleError = require('./common');
    var mongodb = require("mongodb");
    var ObjectID = mongodb.ObjectID;
    var dbConnection=require('./dbConnection');    
    dbConnection.db(
        (database)=>{db=database}
        );
        
    var getSets = function (req, res) {
        db.collection(SETS_COLLECTION).find({}).toArray(function (err, docs) {
            if (err) {
                handleError(res, err.message, "Failed to get sets.");
            } else {
                res.status(200).json(docs);
            }
        })
    }

    var getSetsByWorkout = function (req, res, workoutId) {
        db.collection(SETS_COLLECTION).find({}).toArray(function (err, docs) {
            if (err) {
                handleError(res, err.message, "Failed to get sets.");
            } else {
                var workoutSets = docs.filter(a => a.workoutId == workoutId);
                res.status(200).json(workoutSets);
            }
        })
    }

    var saveSet = function (set, res) {
        db.collection(SETS_COLLECTION).find({ _id: new ObjectID(set._id) }).toArray(function (err, docs) {
            if (err) {
                handleError(res, err.message, "Failed to get Set.");
            } else {
                var existingSet = docs[0];
                if (existingSet) {
                    var updateDoc = set;
                    db.collection(SETS_COLLECTION).updateOne({ _id: new ObjectID(set._id) }, 
                    updateDoc, function (err, doc) {
                        if (err) {
                            handleError(res, err.message, "Failed to update set with id:"+set._id);
                        } else {
                            return doc
                        }
                    });
                } else {
                    set.Created = new Date();
                    db.collection(SETS_COLLECTION).insertOne(set, function (err, doc) {
                        if (err) {
                            handleError(res, err.message, "Failed to create new Set.");
                        } else {
                            return doc.ops[0];
                        }
                    });
                }
            }
        });
    }
    
    var getSet = function (setId){
        db.collection(SETS_COLLECTION).find({_id:setId}).toArray(function (err, docs) {
            if (err) {
                console.log(err.message +  ":Failed to get sets.");
            } else {
                return docs[0];
            }
        })
    }

    var postSet = function (req, res) {
        saveSet(req.body,res,db);
    }
    
    module.exports.postSet=postSet;
    module.exports.saveSet=saveSet;
    module.exports.getSets=getSets;
} ());