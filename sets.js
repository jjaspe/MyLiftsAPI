var SETS_COLLECTION = "Sets";

(function () {
    var setService = require('./set.service');
    
    var getSetsByWorkout = function (req, res, workoutId) {
        setService.getSetsByWorkout(workoutId, (err, data) => {
            handleResponse(err,"Failed to get sets",data, res);
        });
    }

    var getSet = function (req, res, setId) {
        setService.getSet(id, (err, data) => {
            handleResponse(err,"Failed to get set",data, res);
        });
    }

    module.exports.getSets = function (req, res) {
        setService.getSets( (err,data) => {
            handleResponse(err,"Failed to get sets",data, res);
        })
    }

    module.exports.postSet = function (req, res) {
        setService.saveSet(req.body, function (err, data) {
            handleResponse(err,"Failed to save set",data, res);
        })
    }
    
    var handleResponse = function (err, errorMessage, data, res) {
        if (err) {
            handleError(res, err+errorMessage);
        } else {
            res.status(200).json(data);
        }
    }
} ());