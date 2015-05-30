var fs = require('fs');
var _ = require('lodash');
var request = require("request");
var cheerio = require('cheerio');

var wc = require('./web-crawler/web-crawler');
var ps = require('./page-scraper/page-scraper');


wc.getLinks(['http://zk.mk/']);
//ps.findContentDiv([
//  'http://off.net.mk/zhivot-i-zabava/zdravje/amerikancite-dojdoa-do-kubanskiot-lek-za-rak',
//  'http://off.net.mk/vesti/razno/oblachna-e-ovaa-planeta'
//]);