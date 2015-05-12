var fs = require('fs');
var _ = require('lodash');
var request = require("request");
var cheerio = require('cheerio');


(function () {
  var ws = require('./web-crawler/web-crawler2');
  var ps = require('./page-scraper/page-scraper');
  //ws.getLinks(['http://off.net.mk/']);
  ps.findContentDiv('http://off.net.mk/vesti/razno/sramot-od-70-milijardi-dolari');
})();