var fs = require('fs');
var _ = require('lodash');
var request = require("request");
var cheerio = require('cheerio');

(function () {
  var ws = require('./web-crawler/web-crawler');
  ws.startWebCrawler(['http://off.net.mk/', 'http://kajgana.mk/'], 3);
  console.log(ws.getAllLinks());
})();