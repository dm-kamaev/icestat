var express = require('express');

var async = require('async');
var mysql = require('mysql');
var config = require('config');
var bcrypt = require('bcrypt-nodejs');

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
            var sql = "INSERT INTO `users` (`id`, `username`, `password`, `email`, `admin`, `theme`, `mounts_multiselect`) VALUES (?,?,?,?,?,?,?)",

            val = req.body,

            password = bcrypt.hashSync(val.password, null, null);
            var isAdmin = val.admin ? 1 : 0;
            con.query(sql, [null, val.username, password, val.email, isAdmin, val.theme, val.mounts_multiselect], function(err, res) { cb(err, res); });
        },
        function(rows, cb) {
            var sql = 'SELECT * FROM `users` WHERE id=LAST_INSERT_ID();';
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
