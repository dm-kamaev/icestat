var CronJob = require('cron').CronJob;
var humanToCron = require('human-to-cron');
var jobTime = humanToCron('once each day at 01:00');

var cronJob = new CronJob(jobTime, function() {
    console.log(jobTime);
}, null, true, 'Europe/Moscow');
