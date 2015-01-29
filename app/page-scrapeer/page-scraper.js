(function () {
  // requires
  var fs = require('fs');
  var _ = require('lodash');
  var q = require('q');
  var request = require("request");
  var cheerio = require('cheerio');


  // Public
  var pageScrape = {};
  module.exports = pageScrape;

  pageScrape.getLinks = function (body) {
    var aTags = cheerio.load(body)('a');
    var links = {
      external: [],
      internal: []
    };

    for (var i = 0; i < aTags.length; ++i) {
      var link = (aTags.eq(i).attr('href') || '').toLowerCase();

      var internalLink = link.match(internalUrlRegex);
      if (internalLink) {
        var tempLink = 'http://' + response.request.host + internalLink[0];
        links.internal.push(tempLink);
      } else {
        var externalLink = link.match(externalUrlRegex);
        if (externalLink) links.external.push(externalLink[0]);
      }
    }
    links.external = _.uniq(links.external);
    links.internal = _.uniq(links.internal);

    return links;
  };

  pageScrape.findContentDiv = function () {

  }


})();


