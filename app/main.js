var fs = require('fs');
var _ = require('lodash');
var request = require("request");
var cheerio = require('cheerio');

(function () {
  var ws = require('./web-scrape/web-scrape');
  ws.startWebScrape('http://www.time.mk/', 2);
})();