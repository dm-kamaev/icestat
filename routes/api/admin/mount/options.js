var express = require('express');
var mysql = require('mysql');
var config = require('config');

var async = require('async');
var db = config.get('db');

var mounts = require('../../include/mounts');
var mounts_filter = config.get('mounts_filter');

var router = express.Router();
router.post('/', function(req, res, next) {
    var con = mysql.createConnection({
        host: db.host,
        user: db.user,
        password: db.password,
        connectTimeout: db.timeout * 1000
    });

    var station_id = req.query.station_id;
    async.waterfall([
        function(callback) {
            con.connect(callback);
        },
        function(rows, cb) {
            con.query('USE ' + db.admin_db, function(err, res) { cb(err, res); });
        },
        function(rows, cb) {
            var sql = 'SELECT * from `' + db.stations_table + '` WHERE id=' + station_id;
            con.query(sql, function(err, res){ cb(err, res); });
        },
        function(rows, cb) {
            var station = rows[0];
            getMountListByIcecastURL(station, function(err, res) { cb(err, res); });
        },
    ], function(err, data) {
        if (err) {
            err.status = 404;
            next(err);
        } else {
            var options = [];
            for (var i = 0; i < data.length; i++) {
                var name = data[i].mountName;
                options.push({ DisplayText : name, Value : name} );
            }
            var result = {};
            result.Result = "OK";
            result.Options = options;
            res.json(result);
        }
        con.end();
    });
});

function getListenersURL(icecastURL) {
    return icecastURL.substring(0, icecastURL.lastIndexOf("/")) + "/listeners_list.xsl";
}

function getMountListByIcecastURL(station, cb) {
    var url = getListenersURL(station.url);
    mounts.getListeners(url, function(err, result) {
        if (err) {
            cb(null, null); // skip empty mounts
        } else {
            cb(null, result);
        }
    });
}

module.exports = router;

