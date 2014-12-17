// imports
var fs = require('fs');
var _ = require('lodash');
var Q = require('q');
var MongoClient = require('mongodb').MongoClient;


var config = {
  fileDir: '../db/html/'
};
var wordINDEX = {};

//startFileProcessing();
searchMongo(['протест', 'битола']);
//arrayIntersection([[2, 3, 4], [3, 8, 10]]);

function startFileProcessing() {
  console.time('fileProcessing');
  var files = fs.readdirSync(config.fileDir);
  console.log('reading', files.length, 'files');

  files.forEach(function (file, key) {
    readFileSync(config.fileDir + file, key);
  });

  console.timeEnd('fileProcessing');
  saveVarToMongo();

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

var docINDEX = {};
var docNameMAPPER = {};
function searchMongo(words) {
  console.time('mongoFind');
  var files = fs.readdirSync(config.fileDir);



  MongoClient.connect("mongodb://localhost:27017/search-engine", function (err, db) {
    if (err) console.log(err);
    if (!_.isArray(words)) return -1;
    var query = _.transform(words, function (result, word) {
      result.push({word: word});
    });
    var collection = db.collection('engine-test');

    collection.find({$or: query}).toArray(function (err, data) {
      if (err) return err;
      _.each(data, function (mongoDoc) {
        var indexes = mongoDoc.index.split(':');
        _.each(indexes, function (doc) {
          var docId = doc.split('-')[0];
          var docWeight = parseFloat(Math.log(1 + (doc.split('-')[1] || 1)) * Math.log(files.length / indexes.length)); // da se optimizirat i sredit
          if(!docINDEX[docId]) docINDEX[docId] = docWeight;
          else docINDEX[docId] += docWeight;
        })
      });
      db.close();
      var result = [];
      _.each(docINDEX, function(docWeight, docId) {
        result.push({
          docId: docId,
          docWeight: docWeight
        })
      });
      console.log(_.sortBy(result, 'docWeight'));
      console.timeEnd('mongoFind');
    });
  });
}


// za pokasno ova HEEEEEEEHEH
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



