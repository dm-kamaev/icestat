var moment = require('moment');
/*var datestr = "20/Oct/2015:13:23:25 +0300";
var urlencode = require('urlencode');
var test = moment(datestr, "DD/MMM/YYYY:hh:mm:ss Z");*/
var process = require('process');
/*console.log(test.valueOf());

console.log(urlencode.parse('&#1042;&#1040;&#1044;&#1048;&#1052;', {charset: "gbk"}));

console.log(new Buffer('&#1042;&#1040;&#1044;&#1048;&#1052;', 'binary').toString());

*/
var t = process.hrtime();
setTimeout(function() {
    console.log(getTimeOfProcessing(t));
}, 1000);

function getTimeOfProcessing(t) {
    var durationInMilliseconds = getTimeProcessingInMilliseconds(t);
    console.log(durationInMilliseconds);
    return moment.utc(durationInMilliseconds).format("HH:mm:ss.SSS");
}

function getTimeProcessingInMilliseconds(t) {
    var diff = process.hrtime(t);
    var nano = diff[0] * 1e9 + diff[1];
    var ms = nano / 1000000;
    console.log(ms);
    return ms;
}

