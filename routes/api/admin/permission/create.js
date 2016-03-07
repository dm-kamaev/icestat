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
            var sql = "INSERT INTO `permissions` (`id`, `user_id`, `mount_id`, `selected`) VALUES (?,?,?,?)",
            val = req.body,
            selected = val.selected ? 1 : 0;
            con.query(sql, [null, val.user_name, val.mount_name, selected], function(err, res) { cb(err, res); });
        },
        function(result, cb) {
            var sql = "SELECT permissions.id as perm_id, permissions.selected as selected, user_id, mount_id, mounts.name as mount, users.username as username FROM permissions"+
                " JOIN users ON users.id = permissions.user_id" +
                " JOIN mounts ON mounts.id = permissions.mount_id WHERE permissions.id=" + result.insertId ;
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
