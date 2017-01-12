var USERS_COLLECTION = "Users";

(function () {
    var dbConnection=require('./dbConnection');  
    var logger=require('./log.service');  
    dbConnection.db(
        (database)=>{db=database}
        );
        
    module.exports.getUsers = function (req, res) {
        users = db.collection(USERS_COLLECTION).find({}).toArray(function (err, docs) {
            if (err) {
                handleError(res, err.message, "Failed to get users.");
            } else {
                res.status(200).json(docs.map(n=>mapUser(n)));
            }
        });
        return users;
    }

    module.exports.postUser = function (req, res) {        
        if (!(req.body.UserName)) {
            handleError(res, "Invalid user input ", "Must provide a username", 400);
            return;
        }
        if (!(req.body.FirstName || req.body.LastName)) {
            handleError(res, "Invalid user input", "Must provide a first or last name.", 400);
            return;
        }
        db.collection(USERS_COLLECTION).find({ UserName: req.body.UserName }).toArray(function (err, docs) {
            if (err) {
                handleError(res, err.message, "Failed to get user.");
            } else {
                if (docs[0]) {
                    var updateDoc = req.body;
                    updateDoc.LastModified = new Date();
                    db.collection(USERS_COLLECTION).updateOne({ UserName: updateDoc.UserName }, updateDoc, function (err, doc) {
                        if (err) {
                            handleError(res, err.message, "Failed to update user");
                        } else {
                            res.status(202).json(doc);
                        }
                    });
                } else {
                    var newContact = req.body;
                    newContact.Created = new Date();
                    newContact.LastModified = new Date();
                    db.collection(USERS_COLLECTION).insertOne(newContact, function (err, doc) {
                        if (err) {
                            handleError(res, err.message, "Failed to create new user.");
                        } else {
                            res.status(201).json(doc.ops[0]);
                        }
                    });
                }
            }
        });


    }
    

    module.exports.getUser = function (req, res, username) {
        users = db.collection(USERS_COLLECTION).find({ UserName: username }).toArray(function (err, docs) {
            if (err || !docs[0]) {
                logger.log("Couldn't find user");
                res.status(404).json(null);
            }
            else{
                var user=mapUser(docs[0]);             
                logger.log("Found user:"+JSON.stringify(user));
                res.status(200).json(user);
            }
        });        
    }
    
    var mapUser = function (user){
        user.Id=user._id;
        return user;
    }
    
    var handleError=function handleError(res, reason, message, code) {
        console.log("ERROR: " + reason+";"+message);
        res.status(code || 500).json({ "error": message });
    }

     
} ());