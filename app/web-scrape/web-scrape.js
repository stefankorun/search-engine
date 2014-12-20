(function () {
  // requires
  var fs = require('fs');
  var _ = require('lodash');
  var request = require("request");
  var cheerio = require('cheerio');

  var webScrape = {};
  var urlRegex = /(https?:\/\/)(www\.)?(\w+\.?){1,2}(\.\w{2,5}){1,2}/g;

  var globalLinks = [];

  webScrape.startWebScrape = function (startDomain, levelLimit) {
    console.log('Starting web scraping on:', startDomain);

    request.get(startDomain, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var html = cheerio.load(body);
        var aTags = html('a');
        var links = [];

        for (var i = 0; i < aTags.length; ++i) {
          var link = aTags.eq(i).attr('href') || '';
          var linkMatch = link.match(urlRegex);
          if (linkMatch) links.push(linkMatch[0]);
        }
        links = _.uniq(links);
        globalLinks.push(links);

        if (levelLimit) {
          links.forEach(function (link) {
            webScrape.startWebScrape(link, levelLimit - 1);
          });
        }
      } else {
        console.log(error);
      }
    });
  };

  setTimeout(function () {
    console.log(_.union.apply(this, globalLinks));
  }, 5000);

  module.exports = webScrape;
})();


