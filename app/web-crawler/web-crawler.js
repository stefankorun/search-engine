// requires
var Promise = require("bluebird");
var request = require('request');
var async = require('async');
var _ = require('lodash');
var fs = require('fs');

var Memory = require('../memory');
var PageScraper = require('./page-scraper');

module.exports = {
  crawl: crawl
};

function crawlExternal(urls) {
  throttleRequests(urls).then(function () {

  })
}

function throttleRequests(urls, transformer) {
  var deferred = Promise.defer();
  var threshold = 50;
  var responses = [];

  async.eachLimit(urls, threshold, function (url, callback) {
    console.log('request to:', url);

    request.get({uri: url, maxRedirects: 5}, function (error, res) {
      responses.push({
        url: url,
        response: res,
        transformed: (transformer && !error && res.statusCode == 200) ? transformer(res) : null
      });
      callback(null);
    });
  }, function () {
    deferred.resolve(responses);
  });
  return deferred.promise;
}


// public
function crawl(url) {
  var pagesFound = {
    external: [],
    visited: []
  };

  startCrawl(_.isArray(url) ? url : [url], 1);

  function startCrawl(urls, level) {
    var pagesInternal = [];
    urls = _.difference(urls, pagesFound.visited);

    console.log('\n\nSTARTING LEVEL %d \nTOTAL URLS: %d\n', level, urls.length);
    throttleRequests(urls, PageScraper.getLinks).then(function (responses) {
      pagesFound.visited = _.union(pagesFound.visited, urls);

      //var a = _.reduce(responses, function (res, r) {
      //  return {
      //    external: _.union(res.external, r.transformed.external),
      //    internal: _.union(res.internal, r.transformed.internal)
      //  }
      //}, {});
      //console.log(responses);

      if (level === 0) {
        console.log('Done, saving to db', pagesInternal);
        Memory.Mongo.save({base: url}, {pages: pagesFound});
        return pagesFound;
      } else {
        startCrawl(pagesInternal, level - 1);
      }
    });
  }
}


// private
