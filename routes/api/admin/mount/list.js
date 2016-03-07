var express = require('express');

var async = require('async');
var mysql = require('mysql');
var config = require('config');

var router = express.Router();
router.post('/', function(req, res, next) {
    var dbconfig = config.get('db');

    var con = mysql.createConnection({
        host: dbconfig.host,
        user: dbconfig.user,
        password: dbconfig.password,
        connectTimeout: dbconfig.timeout * 1000
    });

    var startIndex = req.query.jtStartIndex;
    var pageSize = req.query.jtPageSize;
    var sort = (req.query.jtSorting) ?  " ORDER BY mounts." + req.query.jtSorting : " ORDER BY mounts.id DESC ";

    var total = 0;
    async.waterfall([
        function(cb) {
            con.connect(function(err, res){
                cb(err, res);
            });
        },
        function(rows, cb) {
            con.query('USE ' + dbconfig.admin_db, function(err, res) { cb(err, res); });
        },
        function(rows, cb) {
            con.query('SELECT COUNT(*) as total from `mounts`', function(err, res){ cb(err, res); });
        },
        function(rows, cb) {
            var sql = "SELECT mounts.id as id, mounts.name as name, mounts.mount as mount, stations.url as station_url, stations.name as station_name, stations.id as stationid FROM `mounts` JOIN stations ON stations.id = mounts.station_id " + sort + " LIMIT " + startIndex + ", " + pageSize,

            val = req.body;

            con.query(sql, function(err, res) { cb(err, res); });
        },
    ], function(err, data) {
        if (err) {
            err.status = 404;
            next(err);
        } else {
            var result = {};
            result.Result = "OK";
            result.TotalRecordCount = total;
            result.Records = data;
            res.json(result);
        }
        con.end();
    });
});

module.exports = router;
