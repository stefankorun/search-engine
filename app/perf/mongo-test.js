var MongoClient = require('mongodb').MongoClient;

// Connect to the db
MongoClient.connect("mongodb://localhost:27017", function(err, db) {
    if(err) { return console.dir(err); }

    var collection = db.collection('perf-test');
    collection.remove(function (err, removed) {});

    console.time('mongo');
    var batch = collection.initializeUnorderedBulkOp({useLegacyOps: true});
    var limit = 10000;
    for(var i = 0; i < limit; ++i) {
        var doc = {word: i, documents: []};
        for(var j = 0; j < limit; ++j) {
            doc.documents.push(j);
        }
        doc.documents = doc.documents.join(':');
        batch.insert(doc, {w: 0});
    }
    batch.execute(function(err, result) {});
    console.timeEnd('mongo');

});


/*
var zlib = require('zlib');
zlib.gzip(new Buffer(perfArray[0]), function (a, b) {
    console.log(a, b, b.length);
    zlib.gunzip(b, function (c, d) {
        console.log(d.length);
    });
});
*/
