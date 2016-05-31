#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */

"use strict";

// ЧТЕНИЕ, ЗАПИСЬ, ДОЗАПИСЬ В ФАЙЛ
// АСИНХРОННОЕ ЧТЕНИЕ МАССИВА ИМЕН ФАЙЛОВ

var fs  = require('fs');
var asc = require('/icestat/my/asc.js');


// OLD METHOD: REMOVE IN FUTURE
exports.read_file = function (path, callback) {
  read(path, callback);
  // fs.readFile(path, {encoding: 'utf8'},
  //   function(err, data) {
  //     if (err) {
  //       callback(err, 'ERROR: read_file => path\n\n'); // TODO: Писать в логи потом
  //     } else {
  //       callback(null, data);
  //     }
  //   });
};


function read (path, cb) {
  fs.readFile(path, {encoding: 'utf8'},
    function(err, data) {
      if (err) {
        console.log('ERROR: read_file => path\n\n', err);
        cb(err, 'ERROR: read_file => path\n\n');
      } else {
        cb(null, data);
      }
    });
}
exports.read = read;


// помещаем данные в callback чтобы передать их в следущую функцию
// для asc.series_move_data
// УДОБНО чтобы во внешнем series не отображались данные
// НО В ПРИНЦИПЕ МОЖНО ПОЛЬЗОВАТЬСЯ И wf.read_file
function read_file_move_data (path, callback) {
  fs.readFile(path, {encoding: 'utf8'},
    function(err, data) {
      if (err) {
        callback(err, 'ERROR: read_file => path\n\n'); // TODO: Писать в логи потом
      } else {
        callback(null, data, 'wf.read_file_move_data');
      }
    });
}
exports.read_file_move_data = read_file_move_data;


function read_file_pathData (path, callback) {
  fs.readFile(path, {encoding: 'utf8'},
    function(err, data) {
      if (err) {
        callback(err, 'ERROR: read_file => path\n\n'); // TODO: Писать в логи потом
      } else {
        callback(null, {'path' : path, 'data' : data});
      }
    });
}
exports.read_file_pathData = read_file_pathData;


function add_file (path, data, callback) {
  // fs.appendFile(path, {encoding: 'utf8'}, data, function (err) {
  fs.appendFile(path, data, function (err) {
    if (err) {
      console.log(err); // TODO: Писать в логи потом
      callback(err, 'ERROR: add_to_file => path\n\n');
    } else {
      callback(null, 'wf.add_file');
    }
  });
}
exports.add_file = add_file;


exports.append = function (path, data, cb) {
  // fs.appendFile(path, {encoding: 'utf8'}, data, function (err) {
  fs.appendFile(path, data, function (err) {
    if (err) {
      console.log(err); // TODO: Писать в логи потом
      cb(err, 'ERROR: add_to_file => path\n\n');
    } else {
      if (cb) { cb(null, 'wf.add_file'); }
    }
  });
};


// default кодировка utf8
function write_file (path, data, callback) {
  fs.writeFile(path, data, 'utf8', function (err) {
    if (err) {
      console.log(err, 'ERROR: write_file => ' + path + '\n\n');
      callback(err, 'ERROR: write_file => ' + path + '\n\n');
    } else {
      callback(null, 'wf.write_file');
    }
  });
}
exports.write_file = write_file;

// TODO: вынести в отдельный модуль file.js
// Отдает массив имен файлов и каталогов
function read_folder (path, callback) {
  fs.readdir(path, function(err, data) {
    if (err) {
      console.log(err + '\n\nERROR: read_file => path\n\n');
      callback(err, 'ERROR: read_folder => path\n\n'); // TODO: Писать в логи потом
    } else {
      callback(null, data);
    }
  });
}
exports.read_folder = read_folder;


// TODO: вынести в отдельный модуль file.js
// Отдает массив имен файлов c допустимым расширением
// ext = {html : 1, xls: 1}
function read_folder_valid_ext (path, ext, callback) {
  fs.readdir(path, function(err, data) {
    if (err) {
      console.log(err + '\n\nERROR: read_file => path\n\n');
      callback(err, 'ERROR: read_folder => path\n\n'); // TODO: Писать в логи потом
    } else {
      data = valid_extension(ext, data);
      callback(null, data);
    }
  });
}
exports.read_folder_valid_ext = read_folder_valid_ext;



// Асинхронное чтение массива имен файлов
// set_result –– функция для того чтобы result помещать в CONTEXT
function read_multiple_files(ar_file, callback) {
  var Series_Arr = [];
  for (var k = 0, l = ar_file.length; k < l; k++) {
    (function(file_name) {
      Series_Arr.push(function(cb) {
        read_file_pathData(file_name, cb);
      });
    }(ar_file[k]));
  }

  asc.series(
    Series_Arr, function(err, result) {
      // result - данные, которые передает каждая отработавшая
      // функция, в виде массива hashes
      // [{path: 'file_path', data: 'strings_from_file'},...]
      // console.log('asc read_files done:', err || result);
      callback(err || null, result || null);
    }
  );
}
exports.read_multiple_files = read_multiple_files;


function valid_extension (ext, data) {
  var res = [];
  for (var i = 0, l = data.length; i < l; i++) {
    var file_name = data[i];
    if (file_name) {
      var match = file_name.match(/\.(.+)$/i);
      if (match && match[0] && match[1]) {
        if (ext[match[1]]) {
          res.push(file_name);
        }
      }
    }
  }
  return res;
}


function clean_file (path, callback) {
  write_file(path, '', callback);
}
exports.clean_file = clean_file;