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
            var sql = "UPDATE `users` SET email=?, mounts_multiselect=? WHERE id=" + val.id;
            var mounts_multiselect = (val.mounts_multiselect == 'true') ? 1 : 0;
            con.query(sql, [val.email, mounts_multiselect], function(err, res) { cb(err, res); });
        },
    ], function(err, data) {
        if (err) {
            err.status = 404;
            next(err);
            res.json({Result: err.message});
        } else {
            res.json({Result: "OK"});
        }
        con.end();
    });
});

module.exports = router;
