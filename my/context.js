#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */

"use strict";

// МОДУЛЬ ДЛЯ РАБОТЫ с CONTEXT

// var color = require('/r_m/nodejs/my/color.js');

// var hash = add_set_get({});
// hash.set('count', 1);
// console.log(hash.get('count'))
// hash.increment('count');
// console.log(hash.get('count'))
function add_set_get (CONTEXT) {
  CONTEXT.set       = gen_set_context();
  CONTEXT.get       = gen_get_context();
  CONTEXT.increment = gen_increment_context();
  return CONTEXT;
}

exports.add_set_get = add_set_get;

////////////////////////////////////
// Паттерн использования:
// context.set('name',name);                    // всегда
// var name=context.get('name') || default_val; // ТОЛЬКО для обязательных ключей context
// if(context.name) {...}                       // для опциональных ключей context
////////////////////////////////////
// context.get = my_context.gen_get_context();
// this===context
// var req = context.get('req');
function gen_get_context() {
  return function(key) {
    var val = this[key];
    if(val) {
      return val;
    } else {
      // my_util.process_err('context.get Error:', 'context.get.'+key+'===UNDEFINED '+info(this));
      console.log('context.get Error:', 'context.get.' + key + ' === UNDEFINED ' + this);
      return null;
    }
  };
}
exports.gen_get_context = gen_get_context;

////////////////////////////////////
// context.set=my_context.gen_set_context();
// this===context
// context.set('req', req);
function gen_set_context() {
  return function(key, val) {
    if(this[key]) {
      // my_util.process_err('context.set Error:', 'Try twice set context.set.'+key+' '+info(this));
      console.log('context.set Error:', 'Try twice set context.set.'+key+' '+ this);
    } else {
      this[key] = val;
    }
  };
}
exports.gen_set_context = gen_set_context;
////////////////////////////////////



///////////////////////////////////////
// context.set=my_context.gen_increment_context();
// this===context
// context.increment('req', req);
function gen_increment_context () {
  return function(key) {
    if(!this[key]) {
      console.log('context.increment Error:', 'Not exist context.increment'+key+' '+ this);
    } else if (typeof this[key] !== 'number') {
      console.log('context.increment Error:', 'Not digit context.increment.'+key+' '+ this);
    } else {
      this[key] = this[key]+1;
    }
  };
}
exports.gen_increment_context = gen_increment_context;
////////////////////////////////////