// imports
var fs = require('fs');
var _ = require('lodash');

var config = {
    fileDir: 'db/html/'
};
console.time('fileRead');

var MEGA_VAR = {};
readAsync();


function readAsync() {
    fs.readdir(config.fileDir, function (err, files) {
        if (err) throw err;
        console.log('reading', files.length, 'files');
        files.forEach(function (file, key) {
            file = config.fileDir + file;
            fs.readFile(file, 'utf8', function (err, data) {
                if (files.length == (key + 1)) {
                    console.timeEnd('fileRead');
                }
                if (err) {
                    console.log(err);
                    return -1;
                }
                data = data.replace(/[`„“”~!@#$%^&*()_|+\-=?;:'",.\n\r<>\{}\[\]\\\/\d]/gi, ' ')
                    .toLowerCase()
                    .split(' ');
                saveWordArray(data, key);
            });
        })
    });
}
function readSync() {
    fs.readdir(config.fileDir, function (err, files) {
        if (err) throw err;
        console.log('reading', files.length, 'files');
        files.forEach(function (file, key) {
            if(key > 1500) return;
            file = config.fileDir + file;
            data = fs.readFileSync(file, {encoding: 'utf8'});
            /*data = data.replace(/[`„“”~!@#$%^&*()_|+\-=?;:'",.\n\r<>\{}\[\]\\\/\d]/gi, ' ')
                .toLowerCase()
                .split(' ');
            saveWordArray(data, key);*/
        });
        console.timeEnd('fileRead');
    });
}


// helpers
function saveWordArray(array, docID) {
    var preventRepeat = {};
    array.forEach(function (word) {
        if (word.length > 3 && !preventRepeat[word]) {
            if (word.indexOf(' ') > 0) console.log(word);
            if (!MEGA_VAR[word]) MEGA_VAR[word] = '';
            preventRepeat[word] = true;
            MEGA_VAR[word] += (':' + docID);
        }
    })
}

/*setTimeout(function () {
 console.log(Object.keys(MEGA_VAR).length);
 }, 5000);*/

