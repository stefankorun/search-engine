var fs = require('fs');
var _ = require('lodash');
var request = require("request");
var cheerio = require('cheerio');


(function () {
  var ws = require('./web-crawler/web-crawler2');
  ws.getLinks(['http://off.net.mk/']);
})();