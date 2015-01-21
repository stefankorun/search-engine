(function () {
  // requires
  var fs = require('fs');
  var _ = require('lodash');
  var q = require('q');
  var request = require("request");
  var cheerio = require('cheerio');

  var webScrape = {};

  webScrape.startWebCrawler = function (startDomains, levelLimit) {
    console.log('Starting web scraping on:', startDomains);
    if (!_.isArray(startDomains)) startDomains = [startDomains];
    _.each(startDomains, function (domain) {
      crawlPage(domain, levelLimit, true)
    });
  };
  webScrape.getAllLinks = function () {
    var links = fs.readFileSync('web-crawler/links.txt', {encoding: 'utf8'});
    return links.split(';');
  };


  var urlRegex = /(https?:\/\/)(www\.)?(\w+\.?){1,2}(\.\w{2,5}){1,2}/g;
  var globalLinks = [];
  var beenThereDoneThat = [];

  function crawlPage(pageLink, level) {
    if (_.contains(beenThereDoneThat, pageLink)) return;
    beenThereDoneThat.push(pageLink); // TODO ova da se optimizirat so globalLinks

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
        globalLinks.push(links);

        if (level > 0) {
          links.forEach(function (link) {
            crawlPage(link, level - 1);
          });
        } else {
          fs.writeFileSync('web-crawler/links.txt', _.union.apply(this, globalLinks).join(';'));
        }
      } else {
        console.log('network ERR: ', pageLink, error);
      }
    });
  }

  module.exports = webScrape;
})();


