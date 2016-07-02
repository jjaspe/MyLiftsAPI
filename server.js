var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var USERS_COLLECTION = "Users";

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// CONTACTS API ROUTES BELOW
// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  "/contacts"
 *    GET: finds all contacts
 *    POST: creates a new contact
 */
app.get("/Users", function(req, res) {
    db.collection(USERS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get contacts.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.post("/Users", function(req, res) {
    var newContact = req.body;
    newContact.Created = new Date();

    if(!(req.body.UserName)){
        handleError(res,"Invalid user input ", "Must provide a username",400);
    }
    if (!(req.body.FirstName || req.body.LastName)) {
        handleError(res, "Invalid user input", "Must provide a first or last name.", 400);
    }
    
    var user = {};
    db.collection(USERS_COLLECTION).find({}).toArray(function (err, docs) {
        if (err) {
            handleError(res, err.message, "Failed to get user.");
        } else {
            user=docs;
        }
    });
    
    if(user){
        db.collection(USERS_COLLECTION).updateOne({ FirstName: req.params.FirstName,LastName:req.params.LastName }, updateDoc, function (err, doc) {
            if (err) {
                handleError(res, err.message, "Failed to update contact");
            } else {
                res.status(204).end();
            }
        });
    }else{
        db.collection(USERS_COLLECTION).insertOne(newContact, function (err, doc) {
            if (err) {
                handleError(res, err.message, "Failed to create new contact.");
            } else {
                res.status(201).json(doc.ops[0]);
            }
        });
    }
});

/*  "/users/:id"
 *    GET: find contact by id
 *    PUT: update contact by id
 *    DELETE: deletes contact by id
 */
/*
app.get("/users/:id", function(req, res) {
});

app.put("/users/:id", function(req, res) {
});

app.delete("/users/:id", function(req, res) {
});*/