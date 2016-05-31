#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */


"use strict";

// EMAIL

var CONF  = require('/icestat/config.js').settings();
var email = require(CONF.node_modules + 'emailjs');

// forward: ssh -L 25:127.0.0.1:25 root@95.213.143.80
// send(
//   to_gmail({
//     subject:'Test emailjs',
//     text:'I hope this work  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolor suscipit, officia accusantium quos perferendis quaerat facilis doloribus perspiciatis sequi earum, modi accusamus veritatis rerum architecto praesentium. Doloremque itaque voluptates deserunt.Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tenetur aliquid vel optio, et neque, ut ipsa asperiores inventore ab voluptates necessitatibus. Doloremque quod molestias perspiciatis nobis, soluta odio! Laudantium, maxime.'
//   })
// );
exports.send = function (fromWhom_WhereTo, callback) {
  var server  = email.server.connect(get_sender());
  // console.log(get_sender_gmail(),'\n\n', fromWhom_WhereTo);
  server.send(fromWhom_WhereTo, function(err, message) {
    console.log(err || message);
    if (err) {
      // logs.email(undefined, {'get_sender_gmail': get_sender_gmail(), 'fromWhom_WhereTo': fromWhom_WhereTo});
    }
    if (callback) { callback(err || null, ''); }
  });
};


function get_sender () {
  return {
    host:     '127.0.0.1',
    port:     25,
    // ssl:     true,
  };
}


exports.to_gmail = function (obj) {
  return {
    text:    obj.text,
    from:    'RadioStatistica <stat@radiostatistica.ru>',
    to:      CONF.my_gmail,
    // cc:      "else <else@gmail.com>", // кому еще можно послать
    subject: obj.subject,
  };
};


exports.to_rambler = function (obj) {
  return {
    text:    obj.text,
    from:    'RadioStatistica <stat@radiostatistica.ru>',
    to:      CONF.my_rambler,
    // cc:      "else <else@gmail.com>", // кому еще можно послать
    subject: obj.subject,
  };
};