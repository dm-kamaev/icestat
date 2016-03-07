var express = require('express');

var async = require('async');
var mysql = require('mysql');
var config = require('config');
var bcrypt = require('bcrypt-nodejs');

var router = express.Router();
router.post('/', function(req, res, next) {
    var db = config.get('db');

    var con = mysql.createConnection({
        host: db.host,
        user: db.user,
        password: db.password,
        connectTimeout: db.timeout * 1000
    });

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
            var val = req.body,
            sql = "UPDATE `" + db.users_table + "` SET " +
                "username=?, password=?, email=?, admin=?, theme=?, mounts_multiselect=? WHERE id=" + val.id,
            password = bcrypt.hashSync(val.password, null, null);
            con.query(sql, [val.username, password, val.email, val.admin, val.theme, val.mounts_multiselect], function(err, res) { cb(err, res); });
        },
    ], function(err, data) {
        if (err) {
            err.status = 404;
            next(err);
        } else {
            res.json({Result: "OK"});
        }
        con.end();
    });
});

module.exports = router;
