var D      = document, W = window;
var d      = D.documentElement;
var log    = console.log.bind(console);
var error  = console.error.bind(console);

window.addEventListener('load', function(e) {
  setTimeout(function() {// ДЛЯ ТЕСТОВ, ПОТОМ УБРАТЬ
    // show_songs_ratio_days.start();
    // show_songs_ratio_songs.start();
    // showTSLReport();
  }, 900);
});



function getByID(id)               { var el=document.getElementById(id); return (el) ? el : (console.error('ERROR: getByID not get element by id => "#'+id+'"'));}
function getByClass(class_name)    { var el=document.getElementsByClassName(class_name); return (el[0]) ? el[0] : (console.error('ERROR: getByClass not get element by class => ".'+class_name+'"')); }
function getByClassAll(class_name) { var els=document.getElementsByClassName(class_name); if(els&&els.length!==0) return els; else console.error('ERROR: getByClassAll not get elements by class => ".'+class_name+'"');return [];}


function objectLength (obj) {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
}


// console.log(isEmptyHash({1:2}));
// console.log(isEmptyHash([1]));
function isEmptyHash (hash) {
  if (typeof hash === 'object' && !hash.length && hash.length !== 0) {
    for (var i in hash) {
      if (hash.hasOwnProperty(i)) return false;
    }
    return true;
  } else { console.log('ERROR: isEmptyHash | hash: '+hash+' is not hash'); }
}

// console.log(isEmptyArray([]));console.log(isEmptyArray([12,23]));console.log(isEmptyArray({}));
function isEmptyArray (array) {
  if (typeof array !== 'object' && array.length !== 0 && !array.length) {
    error('ERROR: isEmptyArray | array: '+array+' is not array');
    return false;
  }
  if (array.length === 0) return true;
}


// console.log(anyElementHash({1:123, 'hello': 'vasya'}));
function anyElementHash (obj) {
  if (isEmptyHash(obj)) { return null; }
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return obj[key];
  }
}

/**
 * [_R description]
 * @param  string   –– u [url]
 * @param  boolean  –– d [если переданы параметры {}, то POST, иначе GET]
 * @param  function –– s [обработчик succes. Xhr передается]
 * @param  function –– e [обработчик error]
 * @param  digit    –– m [время задержки (5000ms default)]
 */
// Паттерн использования
// _R('/', null, function(Xhr) { console.log(Xhr.responseText);},function(err) {console.log(err)});
// function _R(u,d,s,e,m){var r=(window.XMLHttpRequest)?new XMLHttpRequest():new ActiveXObject("Microsoft.XMLHTTP"),ue="/nss/err"/*если скрипт не лежит на сервере*/,t;if(r){r.open((d)?"POST":"GET",u,true);r.onreadystatechange=function(){if(t){/*Если запрос сработал сразу чистим таймер*/clearTimeout(t)}if(r.readyState==4){if(r.status>=200&&r.status<400){if(s){s(r)}}else{if(u!=ue){_R(ue,"e="+u)}}}};if(e){r.onerror=e;/*назначаем обработчик ошибок для самого AJAX*/m=m||5000;t=setTimeout(function(){/*Если через 5с скрипт не ответил, то обрываем соединение и вызываем функцию обработчик*/r.abort();e(m)},m)}try{r.send(d||null)}catch(z){}}};
function _R(u, d, s, e, m) {
  var r = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"),
    ue = "/nss/err" /*если скрипт не лежит на сервере*/ ,
    t;
  if (r) {
    r.open((d) ? "POST" : "GET", u, true);
    r.onreadystatechange = function() {
      if (t) { /*Если запрос сработал сразу чистим таймер*/
        clearTimeout(t);
      }
      if (r.readyState == 4) {
        if (r.status >= 200 && r.status < 400) {
          if (s) {
            s(r);
          }
        } else {
          if (u != ue) {
            _R(ue, "e=" + u);
          }
        }
      }
    };
    if (e) {
      r.onerror = e; /*назначаем обработчик ошибок для самого AJAX*/
      m = m || 5000;
      t = setTimeout(function() { /*Если через 5с скрипт не ответил, то обрываем соединение и вызываем функцию обработчик*/
        r.abort();
        e(m);
      }, m);
    }
    try {
      r.send(d || null);
    } catch (z) {}
  }
}
