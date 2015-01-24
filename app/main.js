var fs = require('fs');
var _ = require('lodash');
var request = require("request");
var cheerio = require('cheerio');

(function () {
  var ws = require('./web-crawler/web-crawler');
  ws.startWebCrawler(['http://kajgana.com/', 'http://off.net.mk/', 'http://press24.mk/'], 2);
  //console.log(ws.getAllLinks());
})();