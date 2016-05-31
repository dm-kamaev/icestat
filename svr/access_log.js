#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */

"use strict";

// ОПИСАНИЕ СКРИПТА

var CONF  = require('/icestat/config.js').settings();
var wf    = require(CONF.my_modules + 'wf.js');
// var asc   = require(CONF.my_modules + 'asc.js');
// var db    = require(CONF.my_modules + 'usedb.js');
// var fs    = require('fs');
var time  = require(CONF.my_modules + 'time.js');
// var tr    = require(CONF.my_modules   + 'transform_data_from_file_or_base.js');

// var CONTEXT = require('/icestat/my/context.js').add_set_get({});

exports.write = function(req, res) {
  if (CONF.env === 'dev') {
    var header = req.headers;
    // console.log(header);
    // console.log('ip = ', req.ip);
    // console.log('x-forwarded-for = ', header['x-forwarded-for']);
    // console.log('req.connection.remoteAddress = ', req.connection.remoteAddress);
    // console.log('req.connection.socket.remoteAddress = ', req.connection.socket.remoteAddress);
    var ip = (header['x-forwarded-for'] || '').split(',')[0] ||
             req.connection.remoteAddress      ||
             req.socket.remoteAddress          ||
             req.connection.socket.remoteAddress;
    var method     = req.method,
        url        = req.url,
        host       = header.host,
        user_agent = header['user-agent'],
        referer    = header['referer'];
    // 2016/04/29 22:45:07 [error] 24552#0: *343 kevent() reported that connect() failed (61: Connection refused) while connecting to upstream, client: 127.0.0.1, server: , request: "GET /?action=feedback HTTP/1.1", upstream: "http://127.0.0.1:9000/?action=feedback", host: "test.ru", referrer: "http://test.ru/"
    var str =
      time.format('YYYY/MM/DD/ hh:mm:ss',time.get())+'\t'+
      ip+'\t'+
      method+'\t'+
      url+'\t'+
      host+'\t'+
      user_agent+'\t'+
      referer +'\n';
    // console.log(str);
    wf.append(CONF.access_log+time.format('YYYYMMDD', time.get())+'_access_log.log', str);
  }
};
