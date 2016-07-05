var USERS_COLLECTION = "Users";

(function () {
    var getUsers = function (req, res, db) {
        users = db.collection(USERS_COLLECTION).find({}).toArray(function (err, docs) {
            if (err) {
                handleError(res, err.message, "Failed to get users.");
            } else {
                res.status(200).json(docs);
            }
        });
        return users;
    }

    var postUser = function (req, res, db) {

        if (!(req.body.UserName)) {
            handleError(res, "Invalid user input ", "Must provide a username", 400);
        }
        if (!(req.body.FirstName || req.body.LastName)) {
            handleError(res, "Invalid user input", "Must provide a first or last name.", 400);
        }
        db.collection(USERS_COLLECTION).find({ UserName: req.body.UserName }).toArray(function (err, docs) {
            if (err) {
                handleError(res, err.message, "Failed to get user.");
            } else {
                if (docs[0]) {
                    var updateDoc = req.body;
                    updateDoc.LastModified = new Date();
                    db.collection(USERS_COLLECTION).updateOne({ UserName: req.params.UserName }, updateDoc, function (err, doc) {
                        if (err) {
                            handleError(res, err.message, "Failed to update user");
                        } else {
                            res.status(202).json(doc)
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

    var getUser = function (req, res, db, username) {
        db.collection(USERS_COLLECTION).find({ UserName: username }).toArray(function (err, docs) {
            if (err) {
                res.status(404).json(null);
            }
            res.status(201).json(docs[0]);
        });
    }

    module.exports.postUser = function (req, res, db) {
        return postUser(req, res, db);
    }
    module.exports.getUsers = function (req, res, db) {
        return getUsers(req, res, db);
    }
    module.exports.getUser = function (req, res, db, username) {
        return getUser(req, res, db, username);
    }
} ());