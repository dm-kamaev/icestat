var express = require('express');
var mysql = require('mysql');
var config = require('config');

var async = require('async');

var moment = require('moment');
require('moment-range');

var mtables = require('../include/tables');

var router = express.Router();
router.post('/', function(req, res, next) {
    var db = config.get('db');

    var con = mysql.createConnection({
        host: db.host,
        user: db.user,
        password: db.password,
        connectTimeout: db.timeout * 1000,
        timezone: db.timezone
    });

    var params = JSON.parse(req.body.params);
    var ts = JSON.parse(req.body.tableSettings);

    var startIndex = ts.start;
    var pageSize = ts.length;
    var search = ts.search.value;

    var orderColumnName = ts.columns[ts.order[0].column].data;
    var orderDirection = ts.order[0].dir;
    var order = " ORDER BY " + orderColumnName + " " + orderDirection;

    var mount = params.mount;
    var station = params.station;
    var startDate = moment(params.startDate);
    var endDate = moment(params.endDate);
    var range = moment.range(startDate, endDate);

    async.waterfall([
        function(callback) {
            con.connect(callback);
        },
        function(rows, callback) {
            con.query('use `' + db.prefix_playlist + station + '`;', function(err, res){ callback(err, res); });
        },
        function(rows, callback) {
            con.query('SHOW TABLES;', function(err, res){ callback(err, res); });
        },
        function(tables, callback) {
            var where= "WHERE mount='" + mount + "'";
            if (search) where += " AND meta LIKE '%" + search + "%'";
            var sql = "SELECT * FROM `{0}` " + where + order + " LIMIT " + startIndex + ", " + pageSize;
            mtables.getDataFromTables(con, sql, where, range, tables, function(err, res){ callback(err, res); });
        }
    ], function(err, data) {
        if (err) {
            err.status = 404;
            next(err);
        } else {
            for (var i = 0; i < data.Records.length; i++) {
                var ratio = 0;
                if (i + 1 < data.Records.length) {
                  ratio = data.Records[i + 1].count - data.Records[i].count;
                }
                data.Records[i].ratio = ratio;
            }
            res.json({ data: data.Records, recordsTotal: data.TotalRecordCount, recordsFiltered: data.TotalRecordCount });
        }
        con.end();
    });

});

module.exports = router;
