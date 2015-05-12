// requires
var _ = require('lodash');
var q = require('q');
var request = require("request");
var cheerio = require('cheerio');

// private
var externalUrlRegex = /^(https?:\/\/)(www\.)?(\w+\.?)+(\.\w{2,5}){1,2}/g;
var internalUrlRegex = /^(\/[^?#]+)(\?|#.*)?/g;

// public
var pageScrape = {};
module.exports = pageScrape;

pageScrape.getLinks = function (pageUrl) {
  var deferred = q.defer();
  var options = {uri: pageUrl, maxRedirects: 5};
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
      console.log('network ERR: ', pageUrl, error);
      deferred.resolve(null);
    }
  });
  return deferred.promise;
};

pageScrape.findContentDiv = function (urls) {
  var options = {uri: urls, maxRedirects: 5};
  request.get(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(body);
      console.log($('body').contents());
    } else {
      console.log('network ERR: ', urls, error);
    }
  });
};




