/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */

// МОДУЛЬ ДЛЯ РАБОТЫ с CONTEXT


var add_methods_context = (function () {
  "use strict";
  ////////////////////////////////////
  // Паттерн использования:
  // context.set('name',name);                    // всегда
  // var name=context.get('name') || default_val; // ТОЛЬКО для обязательных ключей context
  // if(context.name) {...}                       // для опциональных ключей context
  ////////////////////////////////////
  // context.get = my_context.gen_get_context();
  // this===context
  // var req = context.get('req');
  var gen_get_context = function () {
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

  ////////////////////////////////////
  // context.set=my_context.gen_set_context();
  // this===context
  // context.set('req', req);
  var gen_set_context = function () {
    return function(key, val) {
      if(this[key]) {
        // my_util.process_err('context.set Error:', 'Try twice set context.set.'+key+' '+info(this));
        console.log('context.set Error:', 'Try twice set context.set.'+key+' '+ this);
      } else {
        this[key] = val;
      }
    };
  }
  ////////////////////////////////////


  ///////////////////////////////////////
  // context.set=my_context.gen_increment_context();
  // this===context
  // context.increment('req', req);
  var gen_increment_context = function () {
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

  // ЭКСПОРТИРУЕМЫЕ ДАННЫЕ
  return function (CONTEXT) {
    CONTEXT.set       = gen_set_context();
    CONTEXT.get       = gen_get_context();
    CONTEXT.increment = gen_increment_context();
    return CONTEXT;
  }
}());
