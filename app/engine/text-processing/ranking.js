var graph = require('../dbs/db-graph'),
  config = require('../config/config'),
  db = require('../dbs/db-manager').getInstance(),
  _ = require('underscore');

function getUrls(callback) {
  db.findUrls({}, function(err, res) {
    if(err) {

    } else {
      callback(_.pluck(res, 'url'))
    }
  })
}

exports.initPageRank = function (callback) {

  getUrls(function(res) {

    var result = res;
    var pages = {}, counter = 0, end = 0;
    //var result = ['A', 'B', 'C'];
    for(var i = 0; i < result.length; i++){
      graph.inNodes(result[i], i, function (err, res, index) {
        if(err){
          console.log("Error: " + err);
          return;
        }
        var inLinks = [];
        for(var j = 0; j < res.length; j++){
          inLinks.push(res[j].a.data.url);
        }
        //console.log(result[index], index);
        pages[result[index]] = {pageID: result[index], inLinks: inLinks, PageRank: 1, numOutLinks: 0};
        graph.numOutLinks(result[index], index, function (err, gResult) {
          end++;
          if(err){
            console.log(err + " " + index);
            return;
          }
          pages[result[gResult.index]].numOutLinks = gResult.count;
          if(end == result.length){
            callback(pages);
          }
        });
      });
    }

  console.log('page rank')
  });
};

//d - dumping factor - config
//ITERATIONS - config
exports.pageRank = function (pages) {
  //TODO da go zacuvam page rankov vo baza
  var d = config.pageRank.DUMPING_FACTOR;
  var iterations = config.pageRank.ITERATIONS;
  var pr = 1, sumPrs = 0, inLinks = [];

  for(var i = 0; i < iterations; i++){
    for(var page in pages){
      sumPrs = 0;
      inLinks = pages[page].inLinks;

      for(var j = 0; j < inLinks.length; j++){
        sumPrs += (pages[inLinks[j]].PageRank / pages[inLinks[j]].numOutLinks);
      }

      pr = (1 - d) + d * sumPrs;
      pages[page].PageRank = pr;
    }
  }
  return pages;
};

exports.savePageRank = function(pageRank, callback) {
  db.savePageRank(pageRank, callback)
};