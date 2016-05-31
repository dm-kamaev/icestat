#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */

"use strict";

// ЕСЛИ СЕРВЕР УПАЛ, ТО ДЕЛАЕМ РАЗНЫЕ ДЕЙСТВИЯ

var CONF  = require('/icestat/config.js').settings();
var email = require(CONF.my_modules + 'email.js');


// если сервер упал, то шлем письмо на почту
exports.send_mail =  function () {
  if (CONF.env === 'prod') {
    process.on('uncaughtException', (err) => {
      // console.log('Before failed: ',err,'\nStack: ',err.stack);
      var subject = 'Failed server',
          text    = 'Error: '+err+'\nStack: '+err.stack;
      email.send(email.to_gmail({ subject: subject, text: text }));
      email.send(email.to_rambler({ subject: subject, text: text }));
    });
  }
};


// ОБРАЗЕЦ КОДА
function OLD_CODE(argument) {
  // process.on(‘uncaughtException’, … - получаем err.stack
  // можем отослать письмо, записать в лог, освободить ресурсы (child processes) и даже перезапустить себя


  var SCRIPT='/...';
  var LOG='/...';


  function set_uncaughtException() {

    function stop_all_services(cb) {
      //...
      cb();
    }

    // SCRIPT >> LOG 2>&1
    function restart_self() {
      const out = fs.openSync(LOG, 'a');
      const child = require('child_process').spawn(SCRIPT, [], { detached: true, stdio: [ 'ignore', out, out ] });
            child.unref();
    }

    //
    process.on('uncaughtException', (err) => {
      // рестарт только if
      var restart_need=1;

      var curr_date=my_date.rev_time(new Date()).join('-');

      my_async_parallel.simple_by_functions([
        //function(task_callback) { my_err.async('Caught exception', curr_date + '\n\n' + err.stack + '\n\n', 1, task_callback); },
        //function(task_callback) { process.stdout.write(curr_date + '\n\n' + err.stack + '\n\n'); task_callback(); },
        //function(task_callback) { if (HTTP_SERVER) { HTTP_SERVER.close(); } task_callback(); },
        //function(task_callback) { stop_all_services(task_callback); },

        ], 10, function() {
          if (restart_need) { restart_self(); }
          process.exit(1);
      });

    });
  }
  /////////////////////////////
}
