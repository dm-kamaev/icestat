var httpreq = require('httpreq');
var mtables = require('./tables');
var async = require('async');
var mysql = require('mysql');
var config = require('config');
var moment = require('moment');
require('moment-range');

exports.getListeners = function(icecastURL, cb) {
    httpreq.get(icecastURL, { timeout: 3000 }, function(err, response) {
        if (err) {
            cb(err, null);
        } else {
            var body = response.body;
            var items = body.split(/\n/);
            var result = [];
            for(var i = 0; i < items.length; i++) {
                var item = items[i].trim();
                if (item.length > 0) {
                    var values = item.split(';');
                    var mountItem = {};
                    mountItem.mountName = values[0].trim();
                    if (values.length > 1)
                        mountItem.value = values[1].trim();
                    result.push(mountItem);
                }
            }
            cb(null, result);
        }
    });
};

exports.getFilteredListeners = function(mountItem, cb) {
    var icecastURL = getListenersIcecastURL(mountItem.station_url);
    httpreq.get(icecastURL, { timeout: 3000 }, function(err, response) {
        if (err) {
            cb(err, null);
        } else {
            var body = response.body;
            var items = body.split(/\n/);
            var result = {};
            for(var i = 0; i < items.length; i++) {
                var item = items[i].trim();
                if (item.length > 0) {
                    var values = item.split(';');
                    var resultItem = {};
                    var mountName = values[0].trim();
                    if (values.length > 1)
                        resultItem.value = values[1].trim();
                    if (mountName == mountItem.mount) { // filter by name
                        result = resultItem;
                        result.mountItem = mountItem;
                    }
                }
            }
            cb(null, result);
        }
    });
};

function getListenersIcecastURL(url) {
    return url.substring(0, url.lastIndexOf('/')) + "/listeners_list.xsl";
}

exports.getDataByMount = function(mountItem, callback) {
    var params = this.params;
    var db = config.get('db');

    var con = mysql.createConnection({
        host: db.host,
        user: db.user,
        password: db.password,
        connectTimeout: db.timeout * 1000,
        timezone: db.timezone
    });

    var startDate = moment(params.startDate);
    var endDate = moment(params.endDate);
    var range = moment.range(startDate, endDate);

    var sql = this.sql + " WHERE mount='" + mountItem.mount + "'" +
        (this.groupby ? this.groupby : "");

    async.waterfall([
        function(cb) {
            con.connect(function(err, res){
                cb(err, res);
            });
        },
        function(rows, cb) {
            con.query('use `' + db.prefix_stations + mountItem.hostname + '`;', function(err, res){ cb(err, res); });
        },
        function(rows, cb) {
            con.query('SHOW TABLES;', function(err, res){ cb(err, res); });
        },
        function(tables, cb) {
            mtables.getDataFromTables(con, sql, "", range, tables, function(err, res){ cb(err, res); });
        }
    ], function(err, data) {
        var result = {};
        result.data = data;
        result.mountItem = mountItem;
        callback(err, result);
        con.end();
    });
};
