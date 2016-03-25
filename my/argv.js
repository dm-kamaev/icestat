#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */

"use strict";

// РАБОТА С ПАРАМЕТРАМИ КОМАНДНОЙ СТРОКИ


// console.log(get_simple(['from', 'to']));
function get_simple (array_keys) {
  var argv = process.argv,
      res  = {};
  if (argv.length <= 2) {console.log('Warning: Nothing param for script\n\n');return {};}

  for (var j = 0, l1 = array_keys.length; j < l1; j++) {
    var key  = array_keys[j];
    var i    = j + 2;
    if (argv[i]) {res[key] = argv[i];}
  }

  return res;
}
exports.get_simple = get_simple;
