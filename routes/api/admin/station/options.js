var express = require('express');
var mysql = require('mysql');
var config = require('config');

var async = require('async');

var db = config.get('db');

var mounts_filter = config.get('mounts_filter');

var router = express.Router();
router.post('/', function(req, res, next) {
    var con = mysql.createConnection({
        host: db.host,
        user: db.user,
        password: db.password,
        connectTimeout: db.timeout * 1000
    });

    async.waterfall([
        function(callback) {
            con.connect(callback);
        },
        function(rows, cb) {
            con.query('USE ' + db.admin_db, function(err, res) { cb(err, res); });
        },
        function(rows, cb) {
            con.query('SELECT COUNT(*) as total from `' + db.stations_table + '`', function(err, res){ cb(err, res); });
        },
        function(rows, cb) {
            var sql = 'SELECT id as Value, name as DisplayText from `' + db.stations_table + "`";
            con.query(sql, function(err, res){ cb(err, res); });
        },
    ], function(err, data) {
        if (err) {
            err.status = 404;
            next(err);
        } else {
            var result = {};
            result.Result = "OK";
            result.Options = data;
            res.json(result);
        }
        con.end();
    });
});

module.exports = router;
