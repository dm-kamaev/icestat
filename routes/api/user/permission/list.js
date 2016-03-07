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

    var user_id = req.query.id;

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
            var val = req.body,
            sql = "SELECT permissions.id as perm_id, permissions.selected as selected, user_id, mount_id, mounts.name as mount_name, users.username as user_name FROM permissions " +
                "JOIN users ON users.id = permissions.user_id " +
                "JOIN mounts ON mounts.id = permissions.mount_id WHERE permissions.user_id=" + user_id;
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
