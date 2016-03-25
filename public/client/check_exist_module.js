/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */


// СОЗДАЕМ ОБЕРТКУ для того чтобы через нее экспортировать

// ИНИЦИЛИЗАЦИЯ в самом главном скрипте должна быть
// var check_exist_module = gen_check_exist_module({});
// var MODULES            = check_exist_module.get_modules, require = check_exist_module.get_require;

var gen_check_exist_module = (function () {
  "use strict";
  return function(modules) {
    modules.exports = function(key, val) {
      if (this[key]) {
        console.error('check_exist_module.export Error:', 'Try twice export check_exist_module.export.' + key + ' ' + this);
        console.trace('check_exist_module.export Error:', 'Try twice export check_exist_module.export.' + key + ' ' + this);
      } else {
        this[key] = val;
        return undefined; // destroy object: first = MODULES.exports('first.js', first)
      }
    };

    var require = function(key) { // key –– '/icestat/public/client/time.js'
      var module = modules[key];
      if (module) {
        return module;
      } else {
        console.error('check_exist_module.require Error:', 'check_exist_module.require.' + key + ' === UNDEFINED ' + this);
        console.trace('check_exist_module.require Error:', 'check_exist_module.require.' + key + ' === UNDEFINED ' + this);
        return null;
      }
    };

    return { get_modules: modules, get_require: require };
  };

}());



// ПАТТЕРН ИСПОЛЬЗОВАНИЯ
// var check_exist_module = gen_check_exist_module({});
// var MODULES            = check_exist_module.get_modules, require = check_exist_module.get_require;


// var first = (function() {
//   return {
//     key: "value",
//     key1: "value1",
//   };
// })();
// /* экспортируем и чистим переменную */
// first = MODULES.exports('first.js', first);
// console.log(first, require('first.js'))

