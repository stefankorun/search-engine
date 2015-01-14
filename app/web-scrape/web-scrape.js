(function () {
  // requires
  var fs = require('fs');
  var _ = require('lodash');
  var q = require('q');
  var request = require("request");
  var cheerio = require('cheerio');

  var webScrape = {};

  webScrape.startWebScrape = function (startDomain, levelLimit) {
    console.log('Starting web scraping on:', startDomain);
    scrapePage(startDomain, levelLimit, true);
  };


  var urlRegex = /(https?:\/\/)(www\.)?(\w+\.?){1,2}(\.\w{2,5}){1,2}/g;
  var globalLinks = [];
  var beenThereDoneThat = [];

  function scrapePage(pageLink, level) {
    if (_.contains(beenThereDoneThat, pageLink)) return;
    beenThereDoneThat.push(pageLink);

    request.get(pageLink, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var aTags = cheerio.load(body)('a');
        var links = [];

        for (var i = 0; i < aTags.length; ++i) {
          var link = (aTags.eq(i).attr('href') || '').toLowerCase();
          var linkMatch = link.match(urlRegex);
          if (linkMatch) links.push(linkMatch[0]);
        }

        links = _.uniq(links);
        console.log(pageLink, 'links:\n', links);
        globalLinks.push(links);

        if (level > 0) {
          links.forEach(function (link) {
            scrapePage(link, level - 1);
          });
        }
      } else {
        console.log('network ERR: ', error);
      }
    });
  }

  module.exports = webScrape;
})();


