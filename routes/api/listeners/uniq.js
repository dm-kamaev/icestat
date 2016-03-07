var express = require('express');

var async = require('async');

var mounts = require('../include/mounts');

var router = express.Router();
router.post('/', function(req, res, next) {
    var mountList = JSON.parse(req.body.mounts);
    var sql = "SELECT DATE_FORMAT( date, '%Y-%m-%d' ) AS date, COUNT(*) as count, COUNT(DISTINCT(ip)) as uniq FROM `{0}`";
    async.map(mountList, mounts.getDataByMount.bind({params:req.body, sql: sql}), function(err, results) {
        if (err) {
            err.status = 404;
            next(err);
        } else {
            res.json(results);
        }
    });
});

module.exports = router;
