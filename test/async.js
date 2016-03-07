var async = require('async');

async.map(['file1','file2','file3'], test, function(err, results){
    console.log(results);
});

function test(n, callback) {
    callback(null, n);
}

async.waterfall(
    [
        function(callback) {
            callback(null, 'Node.js', 'JavaScript');
        },
        function(arg1, arg2, callback) {
            var caption = arg1 +' and '+ arg2;
            callback(null, caption);
        },
        function(caption, callback) {
            caption += ' Rock!';
            callback(null, caption);
        }
    ],
    function (err, caption) {
        console.log(caption);
        // Node.js and JavaScript Rock!
    }
);
