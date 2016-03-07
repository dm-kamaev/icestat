var mailer = require('../mailer');
var data = { timeSpent: '10min', access_errors: [], playlist_errors: []};

mailer.send(data, function(err, res) {
    if (err) console.log(err);
    else console.log(res);
});
