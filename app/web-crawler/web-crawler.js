(function () {
  // requires
  var fs = require('fs');
  var _ = require('lodash');
  var q = require('q');
  var request = require("request");
  var cheerio = require('cheerio');


  // Public
  var webScrape = {};
  module.exports = webScrape;
  webScrape.getAllLinks = function () {
    var links = fs.readFileSync('web-crawler/links.txt', {encoding: 'utf8'});
    return links.split(';');
  };
  webScrape.startWebCrawler = function (startDomains, levelLimit) {
    console.log('Starting web scraping on:', startDomains);
    if (!_.isArray(startDomains)) startDomains = [startDomains];
    _.each(startDomains, function (domain) {
      startCrawling(domain, levelLimit, true);
    });
  };

  // Private
  var externalUrlRegex = /^(https?:\/\/)(www\.)?(\w+\.?){1,2}(\.\w{2,5}){1,2}/g;
  var internalUrlRegex = /^(\/[^?#]+)(\?|#.*)?/g;

  var globalLinks = [];
  var beenThereDoneThat = [];

  process.setMaxListeners(0);
  function startCrawlingNor(links, level) {
    
  }
  function startCrawling(pageLink, level) {
    if (_.contains(beenThereDoneThat, pageLink)) return;
    beenThereDoneThat.push(pageLink); // TODO ova da se optimizirat so globalLinks

    console.log(pageLink);
    var options = {uri: pageLink,  maxRedirects: 5};
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
            links.internal.push(internalLink[0]);
          } else {
            var externalLink = link.match(externalUrlRegex);
            if (externalLink) links.external.push(externalLink[0]);
          }
        }
        links.external = _.uniq(links.external);
        links.internal = _(links.internal).uniq().shuffle().slice(0, 49);
        globalLinks.push(links.external);

        if (level > 0) {
          links.internal.forEach(function (link) {
            link = 'http://' + response.request.host + link;
            startCrawling(link, level - 1);
          });
        } else {
          fs.writeFile('web-crawler/links-db/' + response.request.host, _.union.apply(this, globalLinks).join(';'));
        }
      } else {
        console.log('network ERR: ', pageLink, error);
      }
    });
  }

  function urlSamples(pageLink) {
    request.get(pageLink, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var aTags = cheerio.load(body)('a');
        var links = [];

        for (var i = 0; i < aTags.length; ++i) {
          var link = (aTags.eq(i).attr('href') || '').toLowerCase();
          links.push(link);
        }
        console.log(_.uniq(links).join(';\n'));
      } else {
        console.log('network ERR: ', pageLink, error);
      }
    });
  }

  //urlSamples('http://off.net.mk/vesti/mislenja/ne-ljubovta-uveruvanjata-se-slepi');


})();


