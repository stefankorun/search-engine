var cheerio = require('cheerio');
var request = require('request');
var async = require("async");
var _ = require('lodash');

var config = require('../config');


// private
var externalUrlRegex = new RegExp(''
  + /(?:(?:(https?|ftp):)?\/\/)/.source       // protocol
  + /((?:[^:\n\r]+):(?:[^@\n\r]+)@)?/.source  // user:pass
  + /(?:(?:www\.)?([^\/\n\r]+))/.source       // domain
  + /(\/[^?#\n\r]+)?/.source                  // request
  + /(\?[^#\n\r]*)?/.source                   // query
  + /(#?[^\n\r]*)?/.source                    // anchor
);
var internalUrlRegex = /^(\/?(?!(mailto:|javascript:))[^?#)]+)/;

// public
var api = {};
module.exports = api;


api.getLinks = function (response) {
  try {
    var aTags = cheerio.load(response && response.body)('a');
  } catch (ex) {
    console.log(ex, 'getLinks');
    aTags = [];
  }
  var links = {
    external: [],
    internal: []
  };
  for (var i = 0; i < aTags.length; ++i) {
    var link = (aTags.eq(i).attr('href') || '').toLowerCase().replace(/\s+/g, '');

    var isExternalLink = link.match(externalUrlRegex);
    var isInternalLink = link.match(internalUrlRegex);
    if (isExternalLink) {
      if (isExternalLink[3] !== response.request.host) {
        links.external.push(isExternalLink[3]);
      } else if (isExternalLink[4]) {
        isInternalLink = isExternalLink[4].match(internalUrlRegex);
        links.internal.push(response.request.host + isInternalLink[1]);
      }
    } else if (isInternalLink) {
      // todo: IMPORTANT check how relative links are handled, probably bad
      var tempLink = isInternalLink[0].charAt(0) == '/' ? isInternalLink[0] : '/' + isInternalLink[0];
      links.internal.push(response.request.host + tempLink);
    }
  }
  links.external = _.uniq(links.external);
  links.internal = _.uniq(links.internal);
  return links;

};

api.getContent = function (response) {
  if (!response) return [];
  try {
    var body = cheerio.load(response.body, {
      normalizeWhitespace: true
    })('body');
  } catch (ex) {
    console.log(ex, 'getContent');
    return [];
  }
  body.find('script, :input').remove();
  return (
    body.text()
      .replace(/[`„“”~!@#$%^&*()_|+\-=?;:'",.\n\r<>\{}\[\]\\\/\d]/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .toLowerCase()
      .split(' ')
      .filter(function (item) {
        return item.length > 3 && item.length < 10;
      })
  );
};

api.checkLanguage = function (language, response) {
  var content = api.getContent(response).join('').replace(/\s/g, '');

  return _.reduce(content, function (res, char) {
      return res + (config.languages[language].specialChars.indexOf(char) > -1 ? 1 : 0);
    }, 0) > config.languages._threshold;
};

api.findContentDiv = function (urls) {
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

