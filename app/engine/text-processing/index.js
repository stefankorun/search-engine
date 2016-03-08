var Documents = require('./documents'),
  math = require('mathjs'),
  graph = require('../dbs/db-graph'),
  config = require('../config/config'),
  db = require('../dbs/db-mongo').getInstance();
  logTf = 0;


var Index = function() {
  this.index = {};
  this.length = 0;
};

Index.prototype.addData = function (docId, bagOfWords) {

  this.length++;
  index = this.index;
  bagOfWords.each(function (word, tf) {
    logTf = math.round(1 + math.log(tf, 10), 4);
    if(index[word] != undefined){
      index[word].push({i: docId, w: logTf});
    }
    else{
      index[word] = [];
      index[word].push({i:docId, w:logTf});
    }
  });
};

//dN - document number.
//tf-idf
Index.prototype.idf = function (dN) {
  for(var word in this.index){
    var df = this.index[word].length;
    var docIdf = math.round(math.log(dN/df, 10), 4);

    for(var k = 0; k < df; k++){
      this.index[word][k].w = this.index[word][k].w * docIdf;
    }

  }
};

Index.prototype.saveToDatabase = function (cb) {
  db.saveIndex(this.getMongoObject(), cb);
};

Index.prototype.getMongoObject = function () {
  var index = [];
  _.each(this.index, function(val, key) {
    index.push({keyword: key, index: _.sortBy(val, 'w')});
  });
  return index;
};

module.exports = Index;

/*
var bof = require('./bagofwords');
var bagofwords = new bof();
bagofwords.addItem('kasper');
bagofwords.addItem('morkov');
bagofwords.addItem('limon');
bagofwords.addItem('kasper');
bagofwords.addItem('banana');
bagofwords.addItem('kasper');
bagofwords.addItem('haha');
bagofwords.addItem('haha');
bagofwords.addItem('haha');
bagofwords.addItem('haha');


var bagofwords2 = new bof();
bagofwords2.addItem('haha');
bagofwords2.addItem('hehe');
bagofwords2.addItem('limon');
bagofwords2.addItem('lala');
bagofwords2.addItem('banana');
bagofwords2.addItem('kasper');

var bagofwords3 = new bof();
bagofwords3.addItem('haha');
bagofwords3.addItem('gggg');
bagofwords3.addItem('wwww');
bagofwords3.addItem('kasper');

var index = new Index();
index.addData(1, bagofwords);
index.addData(2, bagofwords2);
index.addData(3, bagofwords3);
console.log(index.index);
console.log(index.idf(index.length));

console.log(index.index);

index.initPageRank(function (pages) {
  var p = index.pageRank(pages);
  console.log(p);
});*/