#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */

"use strict";

// СОРТИРОВКИ


// Отсортировать массив объектов, по числовому значению
// console.log([ { name:'Vasya', id: 123456 }, { name:'Petya', id:99887 } ].sort(compare_dig_obj('desc', 'id')));
function compare_dig_obj (sort_type, key) {
  // по возрастанию (от меньшего к большему)
  var asc = function(a, b) {
    if (a[key] < b[key]){return -1;}
    if (a[key] > b[key]){return 1;}
    return 0;
  };

  // по убыванию (от большого к меньшему)
  var desc = function(a, b) {
    if (a[key] > b[key]){return -1;}
    if (a[key] < b[key]){return 1;}
    return 0;
  };
  // if (!key) {console.log('Warning: key is undef');}
  if (sort_type === 'asc') {
    return asc;
  } else if (sort_type === 'desc') {
    return desc;
  } else {
    console.log('Warning: sort_type is wrong!');
  }
}
exports.compare_dig_obj = compare_dig_obj;


// console.log([3,12,78].sort(compare_dig_array('asc')));
function compare_dig_array (sort_type) {
  // по возрастанию (от меьшего к большему)
  var desc = function (a, b) {
    return a - b;
  };
  // по убыванию (от большого к меньшему)
  var asc = function (a, b) {
    return b - a;
  };

  if (sort_type === 'asc') {
    return asc;
  } else if (sort_type === 'desc') {
    return desc;
  } else {
    console.log('Warning: sort_type is wrong!');
  }
}
exports.compare_dig_array = compare_dig_array;


// var arr = [ [ 20160115, 'Rating_Bank_20160115.xls' ],
//   [ 20160116, 'Rating_Bank_20160116.xls' ] ];
// arr.sort(compare_dig_array_index('asc', 0));
// console.log(arr);
function compare_dig_array_index (sort_type, index) {
  // по возрастанию (от меьшего к большему)
  var desc = function (a, b) {
    return a[index] - b[index];
  };
  // по убыванию (от большого к меньшему)
  var asc = function (a, b) {
    return b[index] - a[index];
  };

  if (sort_type === 'asc') {
    return asc;
  } else if (sort_type === 'desc') {
    return desc;
  } else {
    console.log('Warning: compare_dig_array_index: sort_type is wrong!');
  }
}
exports.compare_dig_array_index = compare_dig_array_index;


function compare_dig_array (sort_type, key) {
  // по возрастанию (от меньшего к большему)
  var desc = function (a, b) {
    return a[key] - b[key];
  };
  // по убыванию (от большого к меньшему)
  var asc = function (a, b) {
    return b[key] - a[key];
  };

  if (sort_type === 'asc') {
    return asc;
  } else if (sort_type === 'desc') {
    return desc;
  } else {
    console.log('Warning: sort_type is wrong!');
  }
}
exports.compare_dig_array = compare_dig_array;