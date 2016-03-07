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
            con.query('SELECT COUNT(*) as total from `permissions` WHERE user_id=' + req.body.user_id, function(err, res){ cb(err, res); });
        },
        function(rows, cb) {
            total = rows[0].total;
            var sql = "SELECT permissions.id as permission_id, mount_id, mounts.name as name, mounts.mount as mount, permissions.selected as selected, stations.url as station_url, stations.name as station_name, stations.ftp_host as hostname, stations.id as stationid FROM permissions " +
                "JOIN mounts ON mounts.id = permissions.mount_id " +
                "JOIN stations ON stations.id = mounts.station_id WHERE permissions.user_id=" + req.body.user_id;
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
