(function () {
    var mongodb = require("mongodb");
    var db;
    
    var startDb = function (callback) {
        if (!process.env.MONGODB_URI)
            process.env.MONGODB_URI = "mongodb://jjaspe:green123@ds040089.mlab.com:40089/mylifts"
        // Connect to the database before starting the application server.
        mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
            if (err) {
                console.log(err);
                process.exit(1);
            }

            // Save database object from the callback for reuse.
            db = database;
            callback(err,database);
        });
    }
    module.exports.startDb = startDb;   
    module.exports.db = function (callback){
        if(db){
            return db;            
        }
        else
            startDb(function(err,database){
                if(database){
                    db=database;
                    callback(db);
                }
            })
    }
   
} ());


