// requires
var cheerio = require('cheerio');
var request = require('request');
var async = require("async");
var _ = require('lodash');
var q = require('q');

// private
var externalUrlRegex = /^(https?:\/\/)(www\.)?(\w+\.?)+(\.\w{2,5}){1,2}/;
//var internalUrlRegex = /^(\/[^?#]+)(\?|#.*)?/g; - old version
var internalUrlRegex = /^(\/?(?!mailto:)[^?#)]+)/;

// public
var pageScrape = {};
module.exports = pageScrape;

pageScrape.getLinks = function (body, response) {
  var aTags = cheerio.load(body)('a');
  var links = {
    external: [],
    internal: []
  };
  for (var i = 0; i < aTags.length; ++i) {
    var link = (aTags.eq(i).attr('href') || '').toLowerCase();

    var internalLink = link.match(internalUrlRegex);
    var externalLink = link.match(externalUrlRegex);
    if (externalLink) {
      if (externalLink[0].indexOf(response.request.host) == -1) {
        links.external.push(externalLink[0]);
      } else {
        var tempLink = externalLink.input.replace(externalLink[0], '');
        internalLink = tempLink.match(internalUrlRegex);
      }
    } else if (internalLink) {
      var tempLink = internalLink[0].charAt(0) == '/' ? internalLink[0] : '/' + internalLink[0];
      tempLink = 'http://' + response.request.host + tempLink;
      links.internal.push(tempLink);
    }
  }
  links.external = _.uniq(links.external);
  links.internal = _.uniq(links.internal);
  return links;

};

pageScrape.findContentDiv = function (urls) {
  var results = [];
  async.each(urls, function (url, callback) {
    var options = {uri: url, maxRedirects: 5};
    request.get(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(body, {
          normalizeWhitespace: true
        });
        results.push(getPageContents($));
      } else {
        console.log('network ERR: ', urls, error);
      }
      callback(null);
    });
  }, function (err) {
    var bestMatch = _.max(results[0], function (page) {
      return page.text.length;
    });
    console.log(err, results);
    console.log('Best match element is:', bestMatch)
  });

  function getPageContents($) {
    var data = [];
    var body = $('body');
    $('script').remove();
    getDivContent(body);

    // TODO cudna rekurzija mojt popametno valda
    function getDivContent(div) {
      var children = div.children();

      if (_containingMainElements(children)) {
        children.each(function (index, item) {
          getDivContent($(item));
        })
      } else {
        var text = div.text().trim().replace(/\s{2,}/g, ' ').replace(/[!-\/]/g, '');
        if (text.length > 0) {
          data.push({
            element: div,
            text: text.toLowerCase().split(' ')
          })
        }
      }
    }

    // helpers
    function _containingMainElements(children) {
      var mainElements = ['div', 'section'];
      var childrenElements = _.pluck(children, 'name');
      return _.intersection(mainElements, childrenElements).length > 0;
    }

    return data;
  }
};

