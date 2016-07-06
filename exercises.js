var EXERCISES_COLLECTION = "Exercises";

(function () {
    var bodypartsService=require("./bodyparts");
    var dbConnection=require('./dbConnection');    
    dbConnection.db(
        (database)=>{db=database}
        );

    var getExercises = function (req, res) {
        db.collection(EXERCISES_COLLECTION).find({}).toArray(function (err, docs) {
            if (err) {
                handleError(res, err.message, "Failed to get exercises.");
            } else {
                res.status(200).json(docs);
            }
        })
    }

    var createExercise= function(req){
        var newExercise = req.body;
        newExercise.LastModified = new Date();
        newExercise.bodyparts = newExercise.bodyparts.map(a => a.Id);
        return newExercise;
    }
    
    var postExercise = function (req, res) {
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
                                a=>bodypartsService.updateBodypartExercises(db,a,newExercise._id))
                            res.status(201).json(doc.ops[0]);
                        }
                    });
                }
            }
        });


    }

    module.exports.getExercises = function (req, res) {
        return getExercises(req, res);
    }

    module.exports.postExercise = function (req, res) {
        return postExercise(req, res);
    }
} ());