var express = require('express');
var async = require('async');
var mysql = require('mysql');
var config = require('config');

var moment = require('moment');
require('moment-range');

var db = config.get('db');

var router = express.Router();
router.post('/', function(req, res, next) {
    var startDate = moment(req.body.startDate).startOf('day');
    var endDate = moment(req.body.endDate).endOf('day');
    var range = moment.range(startDate, endDate);
    var mountItem = JSON.parse(req.body.mountItem);

    var pool = mysql.createPool({
        host: db.host,
        user: db.user,
        password: db.password,
        connectionLimit : 100,
        acquireTimeout: db.poolTimeout * 1000,
        multipleStatements: true,
        timezone: db.timezone
    });

    // if request terminanted unexpectedly
    res.on("close", function () {
        if (pool) pool.end();
    });

    var queries = prepareQueryListByRangeAndMount(range, mountItem);
    async.map(queries, getSameTimeListenersFromDB.bind({pool: pool}), function(err, results) {
        var data = [];
        for (var j = 0; j < results.length; j++) {
            var resultItem = results[j];
            if (resultItem) { // if result exists
                for (var i = 0; i < resultItem.length; i++) {
                    var item = resultItem[i];
                    data.push(item);
                }
            }
        }

        if (err) {
            err.status = 404;
            next(err);
        } else {
            res.json(data);
        }
        pool.end();
    });
});

function getSameTimeListenersFromDB(q, callback) {
    var pool = this.pool;

    async.waterfall([
        function(cb) {
            pool.getConnection(function(err, con){
                cb(err, con);
            });
        },
        function(con, cb) {
            async.waterfall([
                function(cbcb) {
                    con.query('use `' + db.admin_db + '`;', function(err, res){ cbcb(err, res); });
                },
                function(res, cbcb) {
                    con.query(q, function(err, res){ cbcb(err, res); });
                },
            ], function(err, rows){
                con.release();
                cb(err, rows);
            });
        },
    ], function(err, rows) {
        if (err) {
            callback(err, null);
        }
        if (rows) {
            callback(null, rows[0]);
        }
    });
}

function prepareQueryListByRangeAndMount(range, mountItem) {
    var results = [];

    var total = moment.duration(15, "minutes");
    var timeStep = moment.utc(total.asMilliseconds()).format("HH:mm:ss");

    var timeList = getTimeListBy(range, mountItem);
    for (var timeKey in timeList) {
        var timeRange = timeList[timeKey];
        var tableName = getTableName(timeRange);
        var query = formatQuery(timeRange, timeStep, getDBName(mountItem), tableName, mountItem.mount);
        results.push(query);
    }
    return results;
}

function getDBName(mountItem) {
    var hostname = mountItem.hostname;
    if (hostname.indexOf('/') != -1)
        hostname = hostname.substring(0, hostname.lastIndexOf('/'));
    return db.prefix_stations + mountItem.hostname;
}

function getTableName(range) {
    return range.start.format('YYYY-MM-DD');
}

function getTimeListBy(range, mountItem) {
    var result = [];
    var step = moment.duration(8, 'hour');
    range.by(step, function(m) {
        var stepRange = moment.range(m, moment(m).add(step));
        result.push(stepRange);
    });
    return result;
}

function formatQuery(timeRange, timeStep, db_name, table_name, mount) {
    var sp = 'CALL GetSameTimeListeners(@RANGE_START, @RANGE_END, @RANGE_STEP, @DB_NAME, @TABLE_NAME, @MOUNT)';

    sp = sp.replace('@RANGE_START', mysql.escape(timeRange.start.format('YYYY-MM-DD HH:mm:ss')));
    sp = sp.replace('@RANGE_END', mysql.escape(timeRange.end.format('YYYY-MM-DD HH:mm:ss')));
    sp = sp.replace('@RANGE_STEP', mysql.escape(timeStep));
    sp = sp.replace('@DB_NAME', mysql.escape(db_name));
    sp = sp.replace('@TABLE_NAME', mysql.escape(table_name));
    sp = sp.replace('@MOUNT', mysql.escape(mount));

    return sp;
}

module.exports = router;
