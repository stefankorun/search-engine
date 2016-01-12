// requires
var request = require('request');
var async = require('async');
var _ = require('lodash');
var fs = require('fs');

var PageScraper = require('./page-scraper');

module.exports = {
  crawlUrl: crawlUrl
};

// public
function crawlUrl(url) {
  if (!_.isArray(url)) url = [url];

  var pagesFound = {
    external: [],
    visited: []
  };

  startCrawl(url, 2);
  function startCrawl(urls, level) {
    var pagesInternal = [];
    urls = _.difference(urls, pagesFound.visited);

    console.log('\n\nSTARTING LEVEL %d \nTOTAL URLS: %d\n', level, urls.length);
    async.eachLimit(urls, 50, function (item, callback) {
      pagesFound.visited.push(item);
      console.log('request to:', item);

      request.get({uri: item, maxRedirects: 5}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var data = PageScraper.getLinks(body, response);
          if (data) {
            pagesFound.external = _.union(pagesFound.external, data.external);
            pagesInternal = _.union(pagesInternal, data.internal);
          }
        }
        callback(null);
      });
    }, function () {
      if (level === 0) {
        console.log(pagesFound, pagesInternal);
        return pagesFound;
      } else {
        startCrawl(pagesInternal, level - 1);
      }
    })
  }
}


// private
