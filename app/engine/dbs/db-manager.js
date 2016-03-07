var dbManager = (function () {

  var instance;

  function init() {

    //var dbConnection = require('./dbconnection');
    var MongoClient = require('mongodb').MongoClient;
    var _ = require('underscore');
    var lodash = require('lodash');
    var dbCfg = require('../config/config').db;
    var connURL = dbCfg.URL;


    return {

      insertUrl: function (url, callback) {
        MongoClient.connect(connURL, function (err, db) {
          var data = {
            url: url
          };
          var collection = db.collection(dbCfg.COLLECTIONS.URLS);
          collection.insertOne(data, function (err, result) {
            if (err) {
              console.log("Error inserting data: " + err);
              callback(err, null);
            }
            else {
              callback(err, result);
            }
            db.close();
          })
        });
      },

      updateUrl: function (url, data, callback) {
        MongoClient.connect(connURL, function (err, db) {
          var collection = db.collection(dbCfg.COLLECTIONS.URLS);
          collection.update({url: url}, {$set: data}, function (err, result) {
            if (err) {
              console.log("Error updating data: " + err);
              callback(err, null);
            }
            else {
              callback(err, result);
            }
            db.close();
          })
        });
      },

      findAllUrls: function (callback) {
        MongoClient.connect(connURL, function (err, db) {
          var collection = db.collection(dbCfg.COLLECTIONS.URLS);
          collection.find({}).toArray(function (err, result) {
            if (err) {
              console.log('Error finding urls: ' + err);
              callback(err, null);
              return;
            }
            else {
              callback(err, result);
            }
            db.close();
          });
        });
      },

      findNextUrls: function (callback) {
        MongoClient.connect(connURL, function (err, db) {
          var collection = db.collection(dbCfg.COLLECTIONS.URLS);
          collection.find({done: false}).toArray(function (err, result) {
            if (err) {
              console.log('Error finding urls: ' + err);
              callback(err, null);
              return;
            }
            else {
              callback(err, result);
            }
            db.close();
          });
        });
      },

      findUrls: function (data, callback) {
        MongoClient.connect(connURL, function (err, db) {
          var collection = db.collection(dbCfg.COLLECTIONS.URLS);
          collection.find(data).toArray(function (err, result) {
            if (err) {
              console.log('Error finding urls: ' + err);
              callback(err, null);
            }
            else {
              callback(err, result);
            }
            db.close();
          });
        });
      },

      readConfig: function (callback) {
        MongoClient.connect(connURL, function (err, db) {
          var collection = db.collection(dbCfg.COLLECTIONS.CONFIG);
          collection.find().toArray(function (err, result) {
            if(err){
              console.log('Error reading config. ' + err);
              callback(err, null);
            }
            else{
              var configRes = {docID: 0, start: 1};
              result.forEach(function (res) {
                if(res.docID != undefined){
                  configRes.docID = {_id: res._id, id: res.docID};
                }
                else if(res.start != undefined){
                  configRes.start = {_id: res._id, start: res.start};
                }
              });
              callback(null, configRes);
            }
            db.close();
          })
        });
      },

      updateConfig: function (id, data, callback) {
        MongoClient.connect(connURL, function (err, db) {
          var collection = db.collection(dbCfg.COLLECTIONS.CONFIG);
          collection.update({_id: id}, {$set: data}, function (err, result) {
            if (err) {
              console.log("Error updating data: " + err);
              callback(err, null);
            }
            else {
              callback(err, result);
            }
            db.close();
          })
        });
      },

      insertConfig: function (data, callback) {
        MongoClient.connect(connURL, function (err, db) {
          var collection = db.collection(dbCfg.COLLECTIONS.CONFIG);
          collection.insert(data, function (err, result) {
            if (err) {
              console.log("Error inserting data: " + err);
              callback(err, null);
            }
            else {
              callback(err, result);
            }
            db.close();
          })
        });
      },

      insertWord: function (data, callback) {
        MongoClient.connect(connURL, function (err, db) {
          var collection = db.collection(dbCfg.COLLECTIONS.WORDS);
          collection.insert(data, function (err, result) {
            if (err) {
              console.log("Error inserting data: " + err);
              callback(err, null);
            }
            else {
              callback(err, result);
            }
            db.close();
          })
        });
      },

      saveIndex: function (index, callback) {
        MongoClient.connect(connURL, function (err, db) {
          var collection = db.collection(dbCfg.COLLECTIONS.INDEX);
          collection.deleteMany({}, function(err,res) {
            var batch = collection.initializeUnorderedBulkOp({useLegacyOps: true});

            _.each(index, function(i) {
              batch.insert(i);
            });

            // Execute the operations
            batch.execute(function(err, result) {
              db.close();
              callback(err, result);
              collection.createIndex( { keyword: "text" } )
            });
          });

        });
      },

      savePageRank: function(pageRank, callback) {
        MongoClient.connect(connURL, function (err, db) {
          var collection = db.collection(dbCfg.COLLECTIONS.PAGE_RANK);
          collection.deleteMany({}, function() {
            var batch = collection.initializeUnorderedBulkOp({useLegacyOps: true});

            _.each(lodash.values(pageRank), function(pr) {
              batch.insert(pr);
            });

            // Execute the operations
            batch.execute(function(err, result) {
              db.close();
              callback(err, result);
            });
          })
        });
      },

      queryResults: function(query) {
        MongoClient.connect(connURL, function (err, db) {
          var collection = db.collection(dbCfg.COLLECTIONS.INDEX);
          var cursor = collection.find({
            keyword: {
              $in: query
            }
          });

          cursor.toArray(function(err, res){
            if(err) {
              console.log(err);
            } else {
              console.log(_.uniq(_.pluck(_.flatten(_.pluck(res, 'index')), 'i')), 'i');
              var pageRankCollection = db.collection(dbCfg.COLLECTIONS.PAGE_RANK);
              var pgCursor = pageRankCollection.find({
                pageID: {
                  $in: _.uniq(_.pluck(_.flatten(_.pluck(res, 'index')), 'i'))
                }
              });
              var indexes = _.flatten(_.pluck(res, 'index'));
              pgCursor.toArray(function(err, result) {
                var searchResults =_.map(result, function(pr) {
                  var score =_.reduce(_.filter(indexes, function(index) {
                    return index.i == pr.pageID;
                  }), function(memo, i) {
                    return memo + (pr.PageRank * i.w);
                  }, 0);

                  return {
                    score: score,
                    page: pr.pageID
                  };
                });

                var sortedSearch = searchResults.sort(function(a,b) {
                  return b.score - a.score;
                });

                console.log('=================================================');
                console.log('=======РЕЗУЛТАТИТЕ ОД ВАШЕТО ПРЕБАРУВАЊЕ=========');
                console.log('=================================================');
                _.each(sortedSearch, function(searchResult) {
                  console.log(searchResult.page, ' ', searchResult.score);
                })

              });
            }
          })
        });
      }

    };

  };

  return {
    getInstance: function () {
      if (!instance) {
        instance = init();
      }
      return instance;
    }
  };

})();


module.exports = dbManager;