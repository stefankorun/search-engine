var Promise = require("bluebird");
var mongoClient = require('mongodb').MongoClient;
var mongoProcess;

module.exports = {
  save: save
};

// public
function save(key, data) {
  connected.then(function (db) {
    var cl = db.collection('temp-collection');
    cl.updateOne(key, {$set: data}, {upsert: true});
  })
}
function read() {

}

// private
var connected;
(function init() {
  connected = connect();
  //save({asd: 'asd'}, {bsd: 'bsd'})
}());

function start() {
  var exec = require('child_process').exec;
  console.log('Starting MongoDB server');

  return new Promise(function (resolve, reject) {
    mongoProcess = exec('cd .. & mongod --config mongod.conf',
      function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        resolve();
        if (error !== null) {
          console.log('exec error: ' + error);
          reject();
        }
      }
    );
  })
}
function connect() {
  var url = 'mongodb://localhost:27017/search-engine-2';

  return mongoClient.connect(url).then(function (db) {
    console.log('SUCCESS connecting to mongo @', url);
    return db;
  }, function (err) {
    console.log('ERROR connecting to mongo @', url);
    return Promise.reject(err);
  });
}


