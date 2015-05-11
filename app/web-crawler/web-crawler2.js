// requires
var fs = require('fs');

var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var q = require('bluebird');
var _ = require('lodash');

// module
var webScrape = {};
module.exports = webScrape;

// private
var externalUrlRegex = /^(https?:\/\/)(www\.)?(\w+\.?)+(\.\w{2,5}){1,2}/g;
var internalUrlRegex = /^(\/[^?#]+)(\?|#.*)?/g;
var pagesFound = {
  external: [],
  visited: []
};

//console.log(externalUrlRegex.exec('https://asd.facebook.com.mk'));
//return;

webScrape.getLinks = function (urls) {
  startCrawl(urls, 3);
};

function startCrawl(urls, level) {
  console.log('\n\n\nSTARTING LEVEL', level);
  console.log('TOTAL URLS: %d \n', urls.length);

  var pagesInternal = [];
  async.eachLimit(urls, 10, function (item, callback) {
    sendPageRequest(item).then(function (data) {
      if (data) {
        pagesFound.external = _.union(pagesFound.external, data.external);
        pagesInternal = _.union(pagesInternal, data.internal);
      }
      callback(null);
    });
  }, function () {
    if (!level) {
      console.log(pagesFound.external);
      fs.writeFile('web-crawler/links-db/NOVO', JSON.stringify(pagesFound.external));
      return pagesFound;
    } else {
      startCrawl(pagesInternal, level - 1);
    }
  })
}

function sendPageRequest(pageLink) {
  var deferred = q.defer();
  if (pagesFound.visited.indexOf(pageLink) > 0) {
    console.log('already visited:', pageLink, pagesFound.visited.length);
    deferred.resolve();
    return deferred.promise;
  }
  pagesFound.visited.push(pageLink);
  console.log('request:', pageLink);

  var options = {uri: pageLink, maxRedirects: 5};
  request.get(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var aTags = cheerio.load(body)('a');
      var links = {
        external: [],
        internal: []
      };

      for (var i = 0; i < aTags.length; ++i) {
        var link = (aTags.eq(i).attr('href') || '').toLowerCase();

        var internalLink = link.match(internalUrlRegex);
        if (internalLink) {
          var tempLink = 'http://www.' + response.request.host + internalLink[0];
          links.internal.push(tempLink);
        } else {
          var externalLink = link.match(externalUrlRegex);
          if (externalLink) links.external.push(externalLink[0]);
        }
      }
      links.external = _.uniq(links.external);
      links.internal = _.uniq(links.internal);
      deferred.resolve(links);
    } else {
      console.log('network ERR: ', pageLink, error);
      deferred.resolve(null);
    }
  });
  return deferred.promise;
}