// requires
var _ = require('lodash');
var q = require('q');
var async = require("async");
var cheerio = require('cheerio');

// private
var externalUrlRegex = /^(https?:\/\/)(www\.)?(\w+\.?)+(\.\w{2,5}){1,2}/g;
var internalUrlRegex = /^(\/[^?#]+)(\?|#.*)?/g;

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
    console.log(err, results);
  });

  function getPageContents($) {
    var data = [];
    var body = $('body');
    $('script').remove();
    getDivContent(body);

    // TODO cudna rekurzija mojt popametno valda
    function getDivContent(div) {
      var children = div.children();

      if (children.length > 3) {
        children.each(function (index, item) {
          getDivContent($(item));
        })
      } else {
        var text = div.text().trim().replace(/\s{2,}/g, ' ').replace(/[!-\/]/g, '');
        data.push({
          attr: div.get(0).attribs,
          text: text
        })
      }
    }

    return data;
  }
};


function getPageRequest() {

}
