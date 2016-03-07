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
            var sql = "INSERT INTO `mounts` (`id`, `station_id`, `name`, `mount`) VALUES (?,?,?,?)",

            val = req.body;

            con.query(sql, [null, val.stationid, val.name, val.mount], function(err, res) { cb(err, res); });
        },
        function(result, cb) {
            var sql = "SELECT mounts.id as id, mounts.name as name, mounts.mount as mount, stations.url as station_url, stations.name as station_name, stations.id as stationid FROM `mounts` JOIN stations ON stations.id = mounts.station_id WHERE mounts.id=" + result.insertId;
            con.query(sql, function(err, res) { cb(err, res); });
        },
    ], function(err, data) {
        if (err) {
            err.status = 404;
            next(err);
        } else {
            res.json({Result : "OK", Record: data[0]});
        }
        con.end();
    });
});

module.exports = router;
