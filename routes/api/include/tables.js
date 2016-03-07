var async = require('async');

var moment = require('moment');
require('moment-range');

var format = require('string-format');

exports.getDataFromTables = function(con, sql, where, range, dbTables, cb) {
    var tablesInDatabase = [];

    dbTables.forEach(function(json){
        for(var key in json){
            tablesInDatabase.push(json[key]);
        }
    });

    // check if each target tableName exists in db
    var tables = [];
    range.by('day', function(m) {
        var tableName = m.format('YYYY-MM-DD');
        if (tablesInDatabase.indexOf(tableName) > -1)
            tables.push(tableName);
    });

    async.map(tables, getDataFromTable.bind({con:con, sql:sql, where:where}), function(err, results){
        if (err) {
            cb(err, null);
        } else {
            cb(null, convertToSingleArray(results));
        }
    });
};

function convertToSingleArray(results) {
    var data = [];
    var total = 0;
    for(var i = 0; i < results.length; i++) {
        var rows = results[i].Records;
        total += results[i].TotalRecordCount;
        for (var k = 0; k < rows.length; k++) {
            var row = rows[k];
            data.push(row);
        }
    }
    var result = {};
    result.Result = "OK";
    result.TotalRecordCount = total;
    result.Records = data;
    return result;
}

function getDataFromTable(tableName, callback) {
    var sql = format(this.sql, tableName);
    var con = this.con;
    var where = this.where;
    async.waterfall([
        function(cb) {
            con.query("SELECT COUNT(*) as total FROM `" + tableName + "` " + where, function(err, rows){ cb(err, rows); });
        },
        function(rows, cb) {
            var total = rows[0].total;
            con.query(sql, function(err, rows){ cb(err, rows, total); });
        }
    ], function(err, data, total){
        if (err) {
            callback(err, null);
        } else {
            var result = {};
            result.TotalRecordCount = total;
            result.Records = data;
            callback(null, result);
        }
    });
}
