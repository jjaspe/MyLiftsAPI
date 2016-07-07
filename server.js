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

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

if(process)
    var port=process.env.PORT
// Initialize the app.
var server = app.listen(port||8090, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});


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
    return bodyPartsService.getBodyParts(req, res)
});

app.post("/Bodyparts", function (req, res) {
    return bodyPartsService.postBodypart(req, res);
})


app.get("/Exercises", function (req, res) {
    return exercisesService.getExercises(req, res)
});

app.post("/Exercises", function (req, res) {
    return exercisesService.postExercise(req, res, ObjectID);
})

app.get("/Exercises/GetExercisesByBodypart/:BodypartId", function (req, res) {
    return null;
})


app.get("/Workouts", function (req, res) {
    return workoutController.getWorkouts(req, res);
});

app.get("/Workouts/GetWorkoutsByUser/:Id", function (req, res) {
    return workoutController.getWorkoutsByUser(req, res, req.params.UserId);
});

app.post("/Workouts", function (req, res) {
    return workoutController.postWorkout(req, res);
});

app.get("/Sets", function (req,res) {
    return setsController.getSets(req,res);
});
