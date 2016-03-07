var express = require('express');
var async = require('async');

var mounts = require('../include/mounts');

var router = express.Router();
router.post('/', function(req, res, next) {
    var mountList = JSON.parse(req.body.mounts);
    var sql = "SELECT DATE_FORMAT(date, '%Y-%m-%d') as date, SUM(duration) as totalSeconds FROM `{0}`";
    var attrs = {params:req.body, sql: sql};
    async.map(mountList, mounts.getDataByMount.bind(attrs), function(err, results) {
        if (err) {
            err.status = 404;
            next(err);
        } else {
            res.json(results);
        }
    });

});

module.exports = router;
