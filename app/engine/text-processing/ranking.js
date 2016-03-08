var graph = require('../dbs/db-graph'),
  config = require('../config/config'),
  db = require('../dbs/db-mongo').getInstance(),
  _ = require('underscore'),
  Promise = require('bluebird');

function getUrls(callback) {
  db.findUrls({}, function(err, res) {
    if(err) {

    } else {
      callback(_.pluck(res, 'url'))
    }
  })
}

//d - dumping factor - config
//ITERATIONS - config
var pageRank = function (pages) {
  var d = config.pageRank.DUMPING_FACTOR;
  var iterations = config.pageRank.ITERATIONS;
  var pr = 1, sumPrs = 0, inLinks = [];

  for(var i = 0; i < iterations; i++){
    for(var page in pages){
      sumPrs = 0;
      inLinks = pages[page] && pages[page].inLinks || [];

      for(var j = 0; j < inLinks.length; j++){
        if(pages[inLinks[j]] && pages[inLinks[j]].numOutLinks && pages[inLinks[j]].numOutLinks > 0) {
          sumPrs +=pages[inLinks[j]].PageRank / pages[inLinks[j]].numOutLinks;
        }
      }

      pr = (1 - d) + d * sumPrs;
      pages[page].PageRank = pr;
    }
  }
  return pages;
};
exports.pageRank = pageRank;

function savePageRank(pageRank, callback) {
  db.savePageRank(pageRank, callback)
}
exports.savePageRank = savePageRank;

exports.calculate = function() {
  db.getPages().then(function(pages) {
    console.log(pages);
    var pr = pageRank(pages);
    db.savePageRank(pr, function(res) {
      console.log(res);
    });
  })
};