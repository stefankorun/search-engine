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


