(function () {
  console.time('slice/splice');
  for (var i = 0; i < 1000000; ++i) {
    var a = '123456789';
    //var splice = a.splice(0, 6);
    //var slice = a.slice(0,6);
    //var hc = [a[0], a[1], a[2], a[3], a[4], a[5], a[6]];
  }
  console.timeEnd('slice/splice');
  return;

  console.time('array');
  var limit = 1000;
  var perfArray = [];

  function fillArray() {
    for (var i = 0; i < limit; ++i) {
      perfArray[i] = [];
      for (var j = 0; j < limit; ++j) {
        perfArray[i][j] = i + j;
      }
    }
  }

  fillArray();
  console.timeEnd('array');

  console.time('parse');
  var parseString = perfArray[0].join(',');
  var parseArray = parseString.split(',');
  console.timeEnd('parse');
})();