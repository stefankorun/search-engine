// requires
var request = require('request');
var async = require('async');
var _ = require('lodash');
var fs = require('fs');

var PageScraper = require('./page-scraper');


// public
var webScrape = {};
webScrape.crawlUrl = function (url) {
  startCrawl(url, 0);
};
module.exports = webScrape;


// private
var pagesFound = {
  external: [],
  visited: []
};

function startCrawl(urls, level) {
  console.log('\n\n\nSTARTING LEVEL %d \nTOTAL URLS: %d\n', level, urls.length);
  var pagesInternal = [];

  async.eachLimit(urls, 50, function (item, callback) {
    if (pagesFound.visited.indexOf(item) > 0) {
      console.log('already visited:', item, pagesFound.visited.length);
      callback(null);
    } else {
      pagesFound.visited.push(item);
      console.log('request:', item);
      var options = {uri: item, maxRedirects: 5};
      request.get(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var data = PageScraper.getLinks(body, response);
          if (data) {
            pagesFound.external = _.union(pagesFound.external, data.external);
            pagesInternal = _.union(pagesInternal, data.internal);
          }
        }
        callback(null);
      });

    }
  }, function () {
    if (!level) {
      //fs.writeFile('web-crawler/links-db/NOVO', JSON.stringify(pagesFound.external));
      return pagesFound;
    } else {
      startCrawl(pagesInternal, level - 1);
    }
  })
}