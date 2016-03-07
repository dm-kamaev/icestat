var fs = require('fs');
var moment = require('moment');

exports.runJobs = function(jobsCallback) {
    var async = require('async');
    var process = require('process');
    var IcecastToMySQL = require('icecast-log-to-mysql');

    var plog, tracer = require('tracer');

    plog = tracer.console(getLogConfig("logs/reports.log"));

    var filterName = 'n1.radioday';
    var optionsAccessLog = {
        name : 'access.log',
        date: getYesterday(),
        logDiffDays: 1,
        skip_insert: true,
        filterByHost: filterName,
        //date: moment('2016-01-01'),
        retryTimesOnFail: 5,
        retryIntervalOnFail: 10000
    };
    var optionsPlaylistLog = {
        name : 'playlist.log',
        date: getYesterday(),
        logDiffDays: 1,
        skip_insert: true,
        filterByHost: filterName,
        //date: moment('2016-01-01'),
        retryTimesOnFail: 5,
        retryIntervalOnFail: 10000
    };

    var timeOfProcessingPlaylistLogs = -1;
    var timeOfProcessingAccessLogs = -1;

    var access_errors = [];
    var playlist_errors = [];
    async.waterfall([
        function(cb) {
            plog.info("Begin of playlist logs parsing");
            var timeTookToParsePlaylistLogs = process.hrtime();
            var parsePlaylistLog = new IcecastToMySQL(optionsPlaylistLog);
            parsePlaylistLog.run(function(err, res) {
                plog.info("TheEnd of playlist logs parsing");
                parsePlaylistLog.freeLogStream();

                access_errors = res.error_messages;
                timeOfProcessingPlaylistLogs = getTimeOfProcessing(timeTookToParsePlaylistLogs);
                plog.info("Parsing of playlist log files takes: " + timeOfProcessingPlaylistLogs  + " seconds");
                cb(err, res);
            });
        },
        function(res, cb) {
            plog.info("Begin of access logs parsing");
            var timeTookToParseAccessLogs = process.hrtime();
            var parseAccessLog = new IcecastToMySQL(optionsAccessLog);
            parseAccessLog.run(function(err, res) {
                plog.info("TheEnd of access logs parsing");
                parseAccessLog.freeLogStream();

                playlist_errors = res.error_messages;
                timeOfProcessingAccessLogs = getTimeOfProcessing(timeTookToParseAccessLogs);
                plog.info("Parsing of access log files takes: " + timeOfProcessingAccessLogs  + " seconds");
                cb(err, res);
            });
        },
    ],
    function(err, res) {
        if (err)
            plog.error(err);

        logr(plog, err, res);

        plog.info("TheEnd of parsing.");

        if (err)
            jobsCallback(err, null);
        else {
            var result = {};
            result.message = "Parsing Success!";
            result.timeParsingAccessLogs = timeOfProcessingAccessLogs;
            result.timeParsingPlaylistLogs = timeOfProcessingPlaylistLogs;
            result.access_errors = access_errors;
            result.playlist_errors = playlist_errors;
            jobsCallback(null, result);
        }
    });
};

function logr(plog, err, res) {
    if (res) {
        for (var i = 0; i < res.length; i++) {
            var resItem = res[i];
            if (resItem) {
                var items = resItem.items;
                if (items) {
                    for (var k = 0; k < items.length; k++) {
                        if (items[k]) {
                            if (err)
                                plog.error(items[k]);
                            else
                                plog.info(items[k]);
                        } else {
                            if (res.ftp)
                                if (res.ftp.host)
                                    plog.info(res.ftp.host + ": empty log information for selected date!");
                        }
                    }
                }
            }
        }
    }
}

function getTimeOfProcessing(t) {
    var durationInMilliseconds = getTimeProcessingInMilliseconds(t);
    return moment.utc(durationInMilliseconds).format("HH:mm:ss.SSS");
}

function getTimeProcessingInMilliseconds(t) {
    var diff = process.hrtime(t);
    var nano = diff[0] * 1e9 + diff[1];
    return nano / 1000000;
}

function getYesterday() {
    return moment().subtract(1, 'day');
}

function getLogConfig(log_file) {
    if (!fs.existsSync("logs"))
        fs.mkdirSync("logs");

    var extension = moment().format("YYYY_MM_DD__HH_mm_ss");
    log_file = log_file + "_" + extension;

    return {
        format : [
            "{{timestamp}}\t({{file}}:{{line}})\t<{{title}}>\t{{message}} ",
            {
                error : "{{timestamp}}\t({{file}}:{{line}})\t<{{title}}>\t{{message}}\nCall Stack:\n{{stack}}",
            }
        ],
        dateformat : "yyyy-mm-dd HH:MM:ss.L",
        transport : function(data) {
            console.log(data.output);
            fs.appendFile(log_file, data.output+"\n", function(err) {
                if (err) console.log(err.message);
            });
        }
    };
}

