var express = require('express');

var async = require('async');

var mounts = require('../include/mounts');

var router = express.Router();
router.post('/', function(req, res, next) {
    var mountList = JSON.parse(req.body.mounts);
    var sql = "SELECT \n" +
            "COUNT(case when duration > 0 and duration <= 300 then 1 end) as d_5min,\n" +
            "COUNT(case when duration >= 300 and duration <= 600 then 1 end) as d_5_10min,\n" +
            "COUNT(case when duration >= 600 and duration <= 3000 then 1 end) as d_10_30min,\n" +
            "COUNT(case when duration >= 18000 then 1 end) as d_more_5h,\n" +
            "COUNT(case when duration >= 7200 and duration <= 18000 then 1 end) as d_2_5h,\n" +
            "COUNT(case when duration >= 3600 and duration <= 7200 then 1 end) as d_1_2h,\n" +
            "COUNT(case when duration >= 1800 and duration <= 3600 then 1 end) as d_30m_1h\n" +
        "FROM `{0}`";
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
