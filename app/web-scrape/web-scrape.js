(function () {
  var request = require("request");
  var fs = require('fs');
  var cheerio = require('cheerio');

  var webScrape = {};

  webScrape.testPublicFunction = function () {
    var urlRegex = /(https?:\/\/)?(www\.)?(\w+\.?){1,2}(\.\w{2,5}){1,2}/g;
    request.get('http://www.forum.kajgana.com/', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var html = cheerio.load(body);
        var aTags = html('a');
        var links = [];
        for (var i = 0; i < aTags.length; ++i) {
          var link = aTags.eq(i).attr('href') || '';
          var linkMatch = link.match(urlRegex);
          if (linkMatch) console.log(linkMatch);
        }

        console.log(links);
      } else {
        console.log(error);
      }
    });
  };

  module.exports = webScrape;
})();


