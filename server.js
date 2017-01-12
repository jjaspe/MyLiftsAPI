var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var dbConnection = require("./dbConnection");

var bodyPartsService = require("./bodyparts");
var usersService = require("./users");
var exercisesService = require("./exercises");
var workoutController = require("./workouts");
var setsController = require("./sets");

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    
    console.log(req.method);
    console.log(req.url);
    if(req.method=='OPTIONS')
    {
        if(!res.statusCode)
            res.sendStatus(200);    
        else
            next();
    }
    else
        next();
        
    // intercept OPTIONS method
    /*if ('OPTIONS' == req.method) {
      console.log("Options");
      if(!res.statusCode)
        res.sendStatus(200);
    }
    else {
      console.log(req.method);
      next();
    }*/
};

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(allowCrossDomain);

if(process)
    var port=process.env.PORT
// Initialize the app.
var server = app.listen(port||8090, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});

//app.options('*',(req,res)=>res.sendStatus(200));

app.post("/Users", function (req, res) {
    return usersService.postUser(req, res);
});

app.get("/Users", function (req, res) {
    return usersService.getUsers(req, res)
});

app.get("/Users/:UserName", function (req, res) {
    return usersService.getUser(req, res, req.params.UserName);
});



app.get("/Bodyparts", function (req, res) {
    return bodyPartsService.getBodyParts(req, res);
});

app.post("/Bodyparts", function (req, res) {
    return bodyPartsService.postBodypart(req, res);
});


app.get("/Exercises", function (req, res) {
    return exercisesService.getExercises(req, res);
});

app.post("/Exercises", function (req, res) {
    return exercisesService.postExercise(req, res);
});

app.get("/Exercises/GetExercisesByBodypart/:BodypartId", function (req, res) {
    return null;
});


app.get("/Workouts", function (req, res) {
    return workoutController.getWorkouts(req, res);
});

app.get("/Workouts/GetWorkoutsByUser/:userId", function (req, res) {
    return workoutController.getWorkoutsByUser(req, res, req.params.userId);
});

app.post("/Workouts", function (req, res) {
    return workoutController.postWorkout(req, res);
});

app.get("/Sets", function (req,res) {
    return setsController.getSets(req,res);
});

app.get("/Sets/:workoutId", function (req,res) {
    return setsController.getSetsByWorkout(req,res,req.params.workoutId);
});

app.delete("/Sets/:setId", function (req,res){
    return setsController.deleteSet(req,res,req.params.setId);
})

