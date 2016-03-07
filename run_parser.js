require('./parser_custom').runJobs(function (err, res) {
    if (err) console.log(err);
    else console.log(res);
});
