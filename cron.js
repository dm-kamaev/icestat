function runCronJob() {
    var CronJob = require('cron').CronJob;
    var humanToCron = require('human-to-cron');
    var clog, ctracer = require('tracer');

    var jobTime = humanToCron('each day at 01:00');
    var cronJob = new CronJob(jobTime, function() {

        clog = ctracer.console(getLogConfig("logs/cron.log"));

        clog.info("CronJob executed! " + jobTime);

        try {
            var parser = require('./parser');
            parser.runJobs(function(err, res) {
                var mailer = require('./mailer');
                if (err) {
                    clog.error(err);
                    mailer.sendError(err, function(err, res) {
                        if (err) clog.error(err);
                        else clog.info(res);
                    });
                } else {
                    clog.info(res);
                    mailer.send(res, function(err, res) {
                        if (err) clog.error(err);
                        else clog.info(res);
                    });
                }
            });
        } catch(e) {
            clog.error(e);
        }
    },
    /* This function is executed when the job stops */
    function () {
        clog.info("CronJob stops! Reload new cron job now!");
        runCronJob();
    }, true, 'Europe/Moscow');
}

function getLogConfig(log_file) {
    var fs = require('fs');
    if (!fs.existsSync("logs"))
        fs.mkdirSync("logs");

    var moment = require('moment');
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
            var fs = require('fs');
            fs.appendFile(log_file, data.output + "\n", 'utf8', function(err) {
                if (err) console.log(err);
            });
        }
    };
}

runCronJob();
