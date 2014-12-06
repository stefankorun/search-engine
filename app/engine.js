// imports
var fs = require('fs');
var _ = require('lodash');

var config = {
    fileDir: 'db/html/'
};
console.time('fileRead');

var MEGA_VAR = {};
fs.readdir(config.fileDir, function (err, files) {
    if (err) throw err;
    files.forEach(function (file, key) {
        file = config.fileDir + file;
        fs.readFile(file, 'utf8', function (err, data) {
            if (files.length == (key + 1)) {
                console.timeEnd('fileRead');
            }
            if (err) return err;
            data = data.replace(/[`„“”~!@#$%^&*()_|+\-=?;:'",.\n\r<>\{}\[\]\\\/\d]/gi, '')
                .toLowerCase()
                .split(' ');
            saveWordArray(data, key);
        });
    })
});


// helpers
function saveWordArray(array, docID) {
    var preventRepeat = {};
    array.forEach(function (word) {
        if (word.length > 3 && !preventRepeat[word]) {
            if (!MEGA_VAR[word]) MEGA_VAR[word] = '';
            preventRepeat[word] = true;
            MEGA_VAR[word] += (':' + docID);
        }
    })
}
setTimeout(function () {
    console.log(Object.keys(MEGA_VAR));
}, 10000);