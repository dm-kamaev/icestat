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

    var startIndex = req.query.jtStartIndex;
    var pageSize = req.query.jtPageSize;
    var sort = (req.query.jtSorting) ?  " ORDER BY " + req.query.jtSorting : " ORDER BY id DESC ";

    var total = 0;
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
            con.query('SELECT COUNT(*) as total from `users`', function(err, res){ cb(err, res); });
        },
        function(rows, cb) {
            var sql = "SELECT *  FROM `users` " + sort + " LIMIT " + startIndex + ", " + pageSize,

            val = req.body;

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
