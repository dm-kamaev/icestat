#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */

"use strict";

// РАБОТА С CHILD PROCESS
// TODO: Навести порядок


var child_process = require('child_process');
var fs            = require ('fs');
// ВНИМАНИЕ: ЗАПУСК ИЗ SUBLIME НЕ РАБОТАЕТ

// command –– string, handler –– function(err, stdout, stderr) {}
function simple_call (command, handler) {
  if (!handler) {
    handler = function(err, stdout, stderr) {
        if (err) {
          console.log('EXEC ERROR: ' + err);
        } else if (stderr){
          console.log('STDERR: ' + stderr);
        } else {
          console.log('STDOUT: ' + stdout);
        }
      };
  }
  console.log('-------------- child.simple_call ---------------------');
  console.log('command   = ', command);
  console.log('-----------------------------------');
  child_process.exec(command, handler);
}
exports.simple_call = simple_call;


// command –– string, cb –– callback вызываемый внутри handler (для передачи данных)
function simple_call_get_data (command, cb) {
  child_process.exec(command, function(err, stdout, stderr) {
    if (err || stderr) {console.log('Warning: exec error –– ' + err);}
    cb(err || null, {'command' : command, 'err' : err, 'stdout' : stdout, 'stderr' : stderr});
  });
}
exports.simple_call_get_data = simple_call_get_data;


// ПАТТЕРН ВЫЗОВА
// spawn_write_file(['/usr/local/bin/node', '/r_m/periodical/ins_in_Banks.js'], '/r_m/perl/result_code.txt',
//   function(err, result) {
//     console.log(err || null, result || null);
//   }
// );
// TODO: В будущем передавать строку, а не массив, если будет удобно
function spawn_write_file (commandWithOption, path, cb) {
  var command   = commandWithOption[0],
      option    = commandWithOption.slice(1);
  var spawn     = require('child_process').spawn,
      process   = spawn(command, option), // '/usr/local/bin/node', ['/r_m/periodical/ins_in_Banks.js']
      all_error = null,
      file      = fs.createWriteStream(path, {flags: 'a'});
  process.stdout.pipe(file);
  process.stderr.pipe(file);

  process.stdout.on('data', function (data) {
    // console.log('stdout: ' + data);
  });

  process.stderr.on('data', function (err) {
    // console.log('stderr: ' + err);
    all_error = err;
    cb(err.toString('utf8')+'\nERROR: child.spawn_write_file '+get_string(commandWithOption));
  });

  process.on('close', function (code) {
    // console.log('child process exited with code ' + code);
    if (!all_error) { // избавляемся от повторного вызова callback
      cb(null, 'child.spawn_write_file '+get_string(commandWithOption));
    }
  });
  // console.log(command+' '+option.join(' '));
  // global.process.exit();
}
exports.spawn_write_file = spawn_write_file;





// ex3();
function ex3 () {
  var spawn = require('child_process').spawn,
      node  = spawn('/usr/local/bin/node', ['/r_m/nodejs/js/server.js']);
      // node  = spawn('');

  node.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
  });

  node.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  node.on('close', function (code) {
    console.log('child process exited with code ' + code);
  });
}


// TODO: Вынести в отдельный модуль
// read_from_console();
function read_from_console () {
  var stdin = process.openStdin();

  stdin.addListener("data", function(d) {
      // note:  d is an object, and when converted to a string it will
      // end with a linefeed.  so we (rather crudely) account for that
      // with toString() and then substring()
      console.log("you entered: [" +
          d.toString().trim() + "]");
    });
}


/**
 * @param  array  commandWithOption –– массив ['команда', 'опция_1', 'опция_2', ...]
 * @return string                   –– строку
 */
function get_string (commandWithOption) {
  return commandWithOption.join(' ');
}


