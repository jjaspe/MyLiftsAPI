var SETS_COLLECTION = "Sets";

(function () {
    var mongodb = require("mongodb");
    var ObjectID = mongodb.ObjectID;
    var dbConnection = require('./dbConnection');
    dbConnection.db((database) => { db = database });

    module.exports.saveSet = saveSet = function (set, callback) {
        console.log("\r\nsaveSet called:"+JSON.stringify(set));
        db.collection(SETS_COLLECTION).find({ _id: new ObjectID(set._id) }).toArray(function (err, docs) {
            if (err) {
                handleResponse(err, "Failed to find set with Id:" + set._id, null, callback);
            } else {
                if (docs[0]) {
                    set._id=docs[0]._id;
                    db.collection(SETS_COLLECTION).updateOne({ _id: new ObjectID(set.Id) },
                        set, function (err, doc) {
                            handleResponse(err, "Failed to update set with Id:" + set.Id, set, callback);
                        });
                } else {
                    set.Created = new Date();
                    db.collection(SETS_COLLECTION).insertOne(set, function (err, doc) {
                        if(err){
                            console.log("Failed to create set:"+err);
                            callback(err,null);
                        }else{
                            callback(null,doc.ops[0]);
                        }
                    });
                }
            }
        });
    }
    
    module.exports.saveSets = function (sets, callback){
        console.log("\r\nsaveSets called:"+JSON.stringify(sets));
        if(!sets || !sets[0]){
            callback(null,sets);
        }else{
            sets.forEach( (set,index) => {
                saveSet(set,(err,savedSet)=>{
                    if(!err){
                        set=savedSet;
                    }else{
                        console.log("error saving set:"+JSON.stringify(set));
                        console.log(err);
                    }                
                    if(index==sets.length-1){
                        mapSets(sets);
                        callback(null,sets);                    
                    }
                });
            });
        }
    }

    module.exports.deleteSets = function (sets, callback) {
        sets.forEach(a => this.deleteSet(a._id, callback));
    }

    module.exports.deleteSet = deleteSet = function (setId, callback) {
        db.collection(SETS_COLLECTION).remove({ _id: new ObjectID(setId) }, (err, numberUpdated) => {
            if (err) {
                handleResponse(err, 'Failed to delete set with Id:' + setId, null, callback);
            } else {
                handleResponse(err, 'Updated', numberUpdated, callback);
            }
        });
    }

    module.exports.getSetsByWorkout = function (workout, callback) {
        var workoutId=workout._id;
        db.collection(SETS_COLLECTION).find({ workoutId: new ObjectID(workoutId) }).toArray(function (err, docs) {
            mapSets(docs);
            handleResponse(err, "Failed to get sets for workout with id:" + workoutId, docs, callback);
        });
    }

    module.exports.getSet = getSet = function (id, callback) {
        db.collection(SETS_COLLECTION).find({ _id: new ObjectID(id) }).toArray(function (err, docs) {
            mapSet(docs);
            handleResponse(err, "Failed to get sets for with id:" + id, docs[0], callback);
        });
    }

    module.exports.getSets = function (callback) {
        db.collection(SETS_COLLECTION).find({}).toArray(function (err, docs) {
            mapSets(docs);
            handleResponse(err, "Failed to get sets", docs, callback);
        });
    }
    
    module.exports.getSetsById = function (ids, callback){
        if(!ids || ids.length==0){
            callback(null,[]);
        }
        else
        {
            ids.forEach( (id,index)=> {
                var sets = [];
                getSet(id, (err, setGroup) =>{
                    if(err){
                        console.log("error getting setGroup:"+id);
                    }else{
                        sets.push(setGroup);                    
                    }                    
                    if(index==ids.length-1){
                        callback(null,sets);
                    }
                })
            })
        }
    }

    var mapSets = function (sets) {
        sets.forEach(set => mapSet(set));
    }

    module.exports.mapSet = mapSet = function (set) {
        set.Id = set._id;
    }

    var handleResponse = function (error, errorMessage, data, callback) {
        if (error) {
            callback(errorMessage + "\r\n" + error.message, null);
        } else {
            callback(error, data);
        }
    }
} ());