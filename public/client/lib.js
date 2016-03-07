var log  = console.log.bind(console);


function getByID(id) {
  return document.getElementById(id);
}

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