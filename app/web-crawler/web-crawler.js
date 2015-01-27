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
    if (!_.isArray(startDomains)) startDomains = [startDomains];
    console.log('Starting web scraping on:', startDomains);
    startCrawling2(startDomains, levelLimit);

    //_.each(startDomains, function (domain) {
    //  startCrawling(domain, levelLimit, true);
    //});
  };


  // Private
  var externalUrlRegex = /^(https?:\/\/)(www\.)?(\w+\.?){1,2}(\.\w{2,5}){1,2}/g;
  var internalUrlRegex = /^(\/[^?#]+)(\?|#.*)?/g;

  /* -- version 2 -- */
  var pagesFound = [];
  function startCrawling2(links, level) {
    console.log('\n\n Level', level);
    var linksPromises = [];
    var intLinks, extLinks;

    links = _.shuffle(links).slice(0,69);

    _.each(links, function (link) {
      linksPromises.push(sendPageRequest(link));
    });

    q.all(linksPromises).then(function (data) {
      intLinks = _.union.apply(this, (_.pluck(data, 'internal')));
      extLinks = _.union.apply(this, (_.pluck(data, 'external')));

      pagesFound = _.union(pagesFound, extLinks);
      if (level == 0) {
        console.log(pagesFound);
        fs.writeFile('web-crawler/links-db/startCrawling2', JSON.stringify(pagesFound));
      }
      else if (level > 0) {
        startCrawling2(intLinks, level - 1);
      }
    });


    function sendPageRequest(pageLink) {
      console.log('request:', pageLink);
      var deferred = q.defer();

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
              var tempLink = 'http://' + response.request.host + internalLink[0];
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
          deferred.resolve(null);
          console.log('network ERR: ', pageLink, error);
        }
      });
      return deferred.promise;
    }
  }

  /* -- version 1 -- */
  var globalLinks = [];
  var beenThereDoneThat = [];

  function startCrawling(pageLink, level) {
    if (_.contains(beenThereDoneThat, pageLink)) return;
    beenThereDoneThat.push(pageLink); // TODO ova da se optimizirat so globalLinks

    console.log(pageLink);
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


  /* -- test functions -- */
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


