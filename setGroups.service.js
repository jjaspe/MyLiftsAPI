var SETGROUPS_COLLECTION = "SetGroups";

(function () {
    setsService = require('./set.service');
    var dbConnection = require('./dbConnection');
    dbConnection.db((database) => { db = database });
    var mongodb = require("mongodb");
    var ObjectID = mongodb.ObjectID;
    
    module.exports.saveSetGroups = function (setGroups, callback){
        console.log("\r\nsaveSetGroups called"+JSON.stringify(setGroups));
        setGroups.forEach( (setGroup,index) => {
            saveSetGroup(setGroup , (err,savedSetGroup) => {
                if(!err){                    
                    setGroup=savedSetGroup;  
                                      
                }
                else{
                    console.log("error saving setGroup:"+JSON.stringify(setGroup));
                }
                if(index==setGroups.length-1){
                    mapSetGroups(setGroups);
                    callback(null,setGroups);
                }                
            });
        });
    }
    
    module.exports.saveSetGroup = saveSetGroup = function(setGroup,callback){            
        console.log("\r\nsaveSetGroup called"+JSON.stringify(setGroup));
        if(setGroup && setGroup.sets){
            var sets=setGroup.sets;  
            setsService.saveSets (sets, (err,savedSets)=>{
                console.log("\r\nSets saved"+JSON.stringify(savedSets));
                setGroup.sets=savedSets.map(n=>n._id);
                upsertSetGroup(setGroup, (err,savedSetGroup) => {
                    setGroup=savedSetGroup;
                    console.log("\r\nSets after saving group"+JSON.stringify(savedSets));
                    setGroup.sets=savedSets;
                    console.log("\r\nSetGroup After saving group:"+JSON.stringify(setGroup));
                    callback(null,setGroup);
                    //delete old sets
                });
            });  
        }
        else{
            console.log("SetGroup or SetGroup.sets was undefined");
            callback(null,null);
        }        
    }
    
    module.exports.getSetGroup = getSetGroup = function (id, callback) {
        db.collection(SETGROUPS_COLLECTION).find({ _id: new ObjectID(id) }).toArray(function (err, docs) {
            if(err){
                console.log("Error getting setGroup:"+id);
            }else{
                var setGroup=docs[0];
                 mapSetGroup(setGroup);
                setsService.getSetsById(setGroup.sets, (err,sets)=>{    
                    setGroup.sets=sets;               
                    callback(null,setGroup);
                });
            }
        });
    }

    module.exports.getSetGroupsById = function (ids,callback) {
        if(!ids || ids.length==0){
            callback(null,[]);
        }
        else
        {
            ids.forEach( (id,index)=> {
                var setGroups = [];
                getSetGroup(id, (err, setGroup) =>{
                    if(err){
                        console.log("error getting setGroup:"+id);
                    }else{
                        setGroups.push(setGroup);                    
                    }
                    
                    if(index==ids.length-1){
                        callback(null,setGroups);
                    }
                })
            })
        }
    }
    
    var upsertSetGroup = function (setGroup,callback){
        console.log("\r\nupsertSetGroup called:"+JSON.stringify(setGroup));
        db.collection(SETGROUPS_COLLECTION).find({ _id: new ObjectID(setGroup._id) })
                                               .toArray((err, docs) => {
            if (err) {
                handleResponse(err, "Failed to find set with Id:" + set._id, null, callback);
            } else {
                if (docs[0]) {
                    setGroup._id = docs[0]._id;
                    db.collection(SETGROUPS_COLLECTION).updateOne({ _id: new ObjectID(setGroup.Id) },
                        setGroup, (err, doc) =>{
                            handleResponse(err, "Failed to update setGroup with Id:" + setGroup._id, setGroup, callback);
                        });
                } else {
                    setGroup.Created = new Date();
                    db.collection(SETGROUPS_COLLECTION).insertOne(setGroup,  (err, doc) => {                        
                        if(err){
                            console.log("Failed to create setGroup:"+err);
                            callback(err,null);
                        }else{
                            callback(null,doc.ops[0]);
                        }
                    });
                }
            }
        });
    }
    
    var handleResponse = function (error, errorMessage, data, callback) {
        if (error) {
            callback(errorMessage + "\r\n" + error.message, null);
        } else {
            callback(error, data);
        }
    }
    
    var mapSetGroup = function (setGroup){
        setGroup.Id=setGroup._id;
        return setGroup;
    }
    
    var mapSetGroups = function (setGroups) {
        setGroups.forEach(setGroup=>{
            mapSetGroup(setGroup);
        });
        return setGroups;
    }
} ());