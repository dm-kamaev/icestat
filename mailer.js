var path = require('path');
var EmailTemplate = require('email-templates').EmailTemplate;
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var async = require('async');

var templatesdir = path.resolve('views/mailer/report');
var template = new EmailTemplate(path.join(templatesdir, 'parser'));
var errtemplate = new EmailTemplate(path.join(templatesdir, 'parser', 'err'));

var mysql = require('mysql');
var config = require('config');
var moment = require('moment');

var log, tracer = require('tracer');

exports.sendError = function(err, callback) {
    var msg = {};
    msg.state = 'Parsing failed!';
    msg.reason = err.message;
    send(msg, callback);
};

exports.send = function(msg, callback) {
    log = tracer.console(getLogConfig("logs/mailer.log"));
    log.info("Mailer executed!");
    log.debug(msg);

    var db = config.get('db');

    var con = mysql.createConnection({
        host: db.host,
        user: db.user,
        password: db.password,
        connectTimeout: db.timeout * 1000,
        timezone: db.timezone
    });

    async.waterfall([
        function(cb) {
            con.connect(function(err, res){
                cb(err, res);
            });
        },
        function(rows, cb) {
            con.query('use `' + db.admin_db + '`;', function(err, res){ cb(err, res); });
        },
        function(rows, cb) {
            con.query('SELECT username as name, email FROM users WHERE admin=1;', function(err, res){ cb(err, res); });
        },
        function(admins, cb) {
            log.debug('before send mail');
            log.debug(admins);
            sendMailToAdmins(admins, msg, function(err, res) { cb(err, res); } );
        }
    ], function(err, res) {
        callback(err, res);
        con.end();
    });
};

function sendMailToAdmins(users, msg, cb) {
    var currentDay = moment().format("YYYY-MM-DD HH:mm:ss");

    // prepare nodemailer transport object
    var transport = nodemailer.createTransport(smtpTransport({
        host: 'localhost',
        port: 25,
        /*auth: {
            user: user,
            pass: pass
        },*/
        tls:{
            rejectUnauthorized: false
        }
    }));
    /*var transport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'back.neomind@gmail.com',
            pass: 'test'
        }
    });*/

    log.info('Transport ready!');
    log.debug(transport);

    var currentTemplate = (msg.reason) ? errtemplate : template;
    // Send 10 mails at once
    async.mapLimit(users, 10, function (item, next) {
        item.msg = msg;
        currentTemplate.render(item, function (err, results) {
            if (err) return next(err);
            transport.sendMail({
                from: 'RadioStatistica <stat@radiostatistica.ru>',
                to: item.email,
                subject: 'Daily report ' + currentDay,
                html: results.html,
                text: results.text
            }, function (err, responseStatus) {
                if (err)
                    return next(err);
                log.debug(responseStatus);
                next(null, responseStatus.message);
            });
        });
    }, function (err) {
        if (err)
            log.error(err);
        var result = 'Succesfully sent ' + users.length + ' messages';
        cb(err, result);
    });
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
