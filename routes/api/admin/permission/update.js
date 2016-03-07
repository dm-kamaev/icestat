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
            var sql = "UPDATE `permissions` SET user_id=?, mount_id=?, selected=? WHERE id=" + val.perm_id;
            var selected = val.selected ? 1 : 0;
            con.query(sql, [val.user_id, val.mount_id, selected], function(err, res) { cb(err, res); });
        },
        function(result, cb) {
            var sql = "SELECT permissions.id as perm_id, permissions.selected as selected, user_id, mount_id, mounts.name as mount_name, users.username as user_name FROM permissions"+
                " JOIN users ON users.id = permissions.user_id" +
                " JOIN mounts ON mounts.id = permissions.mount_id WHERE permissions.id=" + val.perm_id;
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
