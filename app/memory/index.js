var mongoClient = require('mongodb').MongoClient;
var mongoProcess;

function init() {
  var exec = require('child_process').exec;
  console.log('Starting MongoDB server');

  mongoProcess = exec('cd .. & mongod --config mongod.conf',
    function (error, stdout, stderr) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    }
  );
}
// init();

function testMongo() {
  var url = 'mongodb://localhost:27017/search-engine-2';
  mongoClient.connect(url, function(err, db) {
    console.log('Connected correctly to server.');
    var col1 = db.collection('node-test-collection');
    col1.insertOne({dunde: 'kure'});
    db.close();
  });
}

