// imports
var fs = require('fs');
var _ = require('lodash');
var Q = require('q');
var async = require('async');
var MongoClient = require('mongodb').MongoClient;

var config = {
    fileDir: 'db/html/'
};
var MEGA_VAR = {};

//startFileProcessing();
//searchMongo(['вапила', 'сирула']);
arrayIntersection([[1, 2, 3], [1]]);

function startFileProcessing() {
    console.time('fileProcessing');
    var files = fs.readdirSync(config.fileDir);
    console.log('reading', files.length, 'files');
    files.forEach(function (file, key) {
        file = config.fileDir + file;
        readFileSync(file, key);
    });
    console.timeEnd('fileProcessing');
    saveVarToMongo();


    // helpers
    function readFileSync(file, key) {
        data = fs.readFileSync(file, {encoding: 'utf8'});
        data = data.replace(/[`„“”~!@#$%^&*()_|+\-=?;:'",.\n\r<>\{}\[\]\\\/\d]/gi, ' ')
            .toLowerCase()
            .split(' ');
        saveWordArray(data, key);
    }

    function saveVarToMongo() {
        MongoClient.connect("mongodb://localhost:27017/search-engine", function (err, db) {
            if (err) console.log(err);
            var collection = db.collection('engine-test');
            var batch = collection.initializeUnorderedBulkOp({useLegacyOps: true});

            _.each(MEGA_VAR, function (index, word) {
                batch.insert({word: word, index: index}, {w: 0}, function (err, result) {
                });
            });
            batch.execute(function (err, result) {
                console.timeEnd('fileProcessing');
            });
        });
    }

    function saveWordArray(array, docID) {
        var preventRepeat = {};
        array.forEach(function (word) {
            if (word.length > 3 && !preventRepeat[word]) {
                if (word.indexOf(' ') > 0) console.log(word);
                if (!MEGA_VAR[word]) MEGA_VAR[word] = docID;
                else MEGA_VAR[word] += (':' + docID);
                preventRepeat[word] = true;
            }
        })
    }
}

function searchMongo(words) {
    console.time('mongoFind');
    MongoClient.connect("mongodb://localhost:27017/search-engine", function (err, db) {
        if (err) console.log(err);
        if (!_.isArray(words)) return -1;

        var collection = db.collection('engine-test');

        var promises = [];
        words.forEach(function (word) {
            var def = Q.defer();
            promises.push(def.promise);
            collection.findOne({word: word}, function (err, item) {
                def.resolve(item);
            });
        });
        Q.all(promises).then(function (data) {
            data = _.map(data, function (item) {
                return item.index.split(':');
            });
            console.log(_.intersection.apply(_, data));
            console.timeEnd('mongoFind');
        });
    });

}
function arrayIntersection(arrs) {
    var LinkedArray = function (a) {
        var array = a;
        var index = -1;

        return {
            getCurrent: function () {
                return array[index];
            },
            getNext: function () {
                return array[++index];
            },
            isLast: function () {
                return array.length <= index;
            }
        }
    };
    function isItTheEnd(linkedArrays) {
        linkedArrays.forEach(function (arr) {
            if(!arr.isLast()) return false;
        });
    }

    arrs = _.map(arrs, function(arr) {
        return new LinkedArray(arr);
    });


    console.log(arrs);
}



