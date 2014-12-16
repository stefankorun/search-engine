// imports
var fs = require('fs');
var _ = require('lodash');
var Q = require('q');
var MongoClient = require('mongodb').MongoClient;

var config = {
  fileDir: '../db/html/'
};
var wordINDEX = {};
var wordCOUNT = {};

startFileProcessing();
//searchMongo(['софија', 'вергара']);
//arrayIntersection([[2, 3, 4], [3, 8, 10]]);

function startFileProcessing() {
  console.time('fileProcessing');
  var files = fs.readdirSync(config.fileDir);
  console.log('reading', files.length, 'files');

  files.forEach(function (file, key) {
    readFileSync(config.fileDir + file, key);
  });

  console.timeEnd('fileProcessing');
  //saveVarToMongo();

  // helpers
  function readFileSync(file, key) {
    var data = fs.readFileSync(file, {encoding: 'utf8'});
    data = data.replace(/[`„“”~!@#$%^&*()_|+\-=?;:'",.\n\r<>\{}\[\]\\\/\d]/gi, ' ')
      .toLowerCase()
      .split(' ');
    saveWordArray(data, key);
  }


  function saveWordArray(array, docID) {
    var repeatCount = {};
    array.forEach(function (word) {
      if (word.length > 3) {
        if (!repeatCount[word]) {
          repeatCount[word] = 1;
          if (!wordINDEX[word]) wordINDEX[word] = docID.toString();
          else wordINDEX[word] += (':' + docID);
        } else {
          ++repeatCount[word];
        }
      }
    });
    for (var word in repeatCount) {
      if (!repeatCount.hasOwnProperty(word)) continue;
      if (repeatCount[word] > 1) wordINDEX[word] += ('-' + repeatCount[word]);
    }
  }

  function saveVarToMongo() {
    MongoClient.connect("mongodb://localhost:27017/search-engine", function (err, db) {
      if (err) console.log(err);
      var collection = db.collection('engine-test');
      var batch = collection.initializeUnorderedBulkOp({useLegacyOps: true});
      _.each(wordINDEX, function (index, word) {
        batch.insert({word: word, index: index}, {w: 0}, function (err, result) {
        });
      });
      batch.execute(function (err, result) {
        console.timeEnd('fileProcessing');
        db.close();
        /*collection.createIndex('word', function (err, result) {
         console.log(err, result);
         console.timeEnd('fileProcessing');
         })*/
      });
    });
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
    var index = 0;

    return {
      getCurrent: function () {
        return array[index];
      },
      incrementIndex: function (maxValue) {
        if (array[index] && (array[index] < maxValue)) {
          index++;
          console.log('incrementing index', index);
        }
        return array[index];
      },
      isLast: function () {
        return array.length <= index;
      }
    }
  };

  function theEnd(linkedArrays) {
    for (var i in linkedArrays) {
      if (!linkedArrays[i].isLast()) return false;
    }
    return true;
  }

  function allEqual(linkedArrays) {
    var value = linkedArrays[0].getCurrent();
    for (var i in linkedArrays) {
      if (linkedArrays[i].getCurrent() != value) return false;
    }
    return true;
  }

  // od ovde pocit jakoto

  arrs = _.map(arrs, function (arr) {
    return new LinkedArray(arr);
  });

  var results = [];
  while (!theEnd(arrs)) {
    if (allEqual(arrs)) results.push(arrs[0].getCurrent());
    var maximum = _.max(arrs, function (arr) {
      return arr.getCurrent();
    });
    maximum = maximum.getCurrent();

    _.each(arrs, function (arr) {
      arr.incrementIndex(maximum);
    })
  }
  return results;
}



