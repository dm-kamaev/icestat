#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */

"use strict";

// Если 0 –– development
// Если 1 –– production

function get () {
  return 0;
}
exports.get = get;