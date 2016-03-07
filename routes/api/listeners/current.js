var express = require('express');
var async = require('async');
var router = express.Router();

var mounts = require('../include/mounts');

router.post('/', function(req, res, next) {
    var mountList = JSON.parse(req.body.mounts);
    async.map(mountList, getListeners, function(err, results) {
        if (err) {
            err.status = 404;
            next(err);
        } else {
            res.json(results);
        }
    });
});

function getListeners(mountItem, callback) {
    mounts.getFilteredListeners(mountItem, function(err, result) {
        callback(err, result);
    });
}

module.exports = router;
