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
            var sql = "UPDATE `" + db.stations_table + "` SET " +
                "name=?, url=?, ftp_host=?, ftp_username=?, ftp_password=?, update_db=? WHERE id=" + val.id;
            con.query(sql, [val.name, val.url, val.ftp_host, val.ftp_username, val.ftp_password, val.update_db], function(err, res) { cb(err, res); });
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
