var express = require('express');

var async = require('async');
var mysql = require('mysql');
var config = require('config');

var router = express.Router();
router.post('/', function(req, res, next) {
    var db = config.get('db');

    var con = mysql.createConnection({
        host: db.host,
        user: db.user,
        password: db.password,
        connectTimeout: db.timeout * 1000
    });

    var val = req.body;
    async.waterfall([
        function(cb) {
            con.connect(function(err, res){
                cb(err, res);
            });
        },
        function(rows, cb) {
            con.query('USE ' + db.admin_db, function(err, res) { cb(err, res); });
        },
        function(rows, cb) {
            var sql = "UPDATE `mounts` SET station_id=?, name=?, mount=? WHERE id=" + val.id;
            con.query(sql, [val.stationid, val.name, val.mount], function(err, res) { cb(err, res); });
        },
        function(result, cb) {
            var sql = "SELECT mounts.id as id, mounts.name as name, mounts.mount as mount, stations.url as station_url, stations.name as station_name, stations.id as stationid FROM `mounts` JOIN stations ON stations.id = mounts.station_id WHERE mounts.id=" + val.id;
            con.query(sql, function(err, res) { cb(err, res); });
        },
    ], function(err, data) {
        if (err) {
            err.status = 404;
            next(err);
        } else {
            res.json({Result: "OK", Record: data[0]});
        }
        con.end();
    });
});

module.exports = router;
