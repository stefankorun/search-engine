// requires
var cheerio = require('cheerio');
var request = require('request');
var async = require("async");
var _ = require('lodash');


// private
var externalUrlRegexOld = /^(https?:\/\/)(www\.)?(\w+\.?)+(\.\w{2,5}){1,2}/;
var externalUrlRegex = new RegExp(''
  + /(?:(?:(https?|ftp):)?\/\/)/.source       // protocol
  + /((?:[^:\n\r]+):(?:[^@\n\r]+)@)?/.source  // user:pass
  + /(?:(?:www\.)?([^\/\n\r]+))/.source       // domain
  + /(\/[^?#\n\r]+)?/.source                  // request
  + /(\?[^#\n\r]*)?/.source                   // query
  + /(#?[^\n\r]*)?/.source                    // anchor
);
var internalUrlRegex = /^(\/?(?!mailto:)[^?#)]+)/;

// public
var pageScrape = {};
module.exports = pageScrape;


pageScrape.getLinks = function (response) {
  var aTags = cheerio.load(response.body)('a');
  var links = {
    external: [],
    internal: []
  };
  for (var i = 0; i < aTags.length; ++i) {
    var link = (aTags.eq(i).attr('href') || '').toLowerCase().replace(/\s+/g, '');

    var externalLink = link.match(externalUrlRegex);
    var internalLink = link.match(internalUrlRegex);
    if (externalLink) {
      if (externalLink[3] !== response.request.host) {
        links.external.push(externalLink[3]);
      } else if (externalLink[4]) {
        internalLink = externalLink[4].match(internalUrlRegex);
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

