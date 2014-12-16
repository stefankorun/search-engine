var MongoClient = require('mongodb').MongoClient;

var mongo = function () {
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
        collection.createIndex('word', function (err, result) {
          console.log(err, result);
          console.timeEnd('fileProcessing');
        })
      });
    });
  }

  return 'wow';
};

module.exports = mongo();