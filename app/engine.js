// imports
var fs = require('fs');
var async = require('async');
var _ = require('lodash');

var config = {
    fileDir: 'db/html/'
};
console.time('fileRead');
var MEGA_VAR = {};

startFileProcessing();
function startFileProcessing() {
    var files = fs.readdirSync(config.fileDir);
    console.log('reading', files.length, 'files');

    var queueArray = [];
    files.forEach(function (file, key) {
        file = config.fileDir + file;
        readFileSync(file, key);
    });
    console.log(Object.keys(MEGA_VAR).length);
    console.timeEnd('fileRead');
}

function readFile(file, key) {
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
}
function readFileSync(file, key) {
    data = fs.readFileSync(file, {encoding: 'utf8'});
    data = data.replace(/[`„“”~!@#$%^&*()_|+\-=?;:'",.\n\r<>\{}\[\]\\\/\d]/gi, ' ')
     .toLowerCase()
     .split(' ');
     saveWordArray(data, key);
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

