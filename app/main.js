var punycode = require('punycode');
var _ = require('lodash');
var request = require('request');

var Memory = require('./memory');
var Crawler = require('./web-crawler/crawler');
var Request = require('./web-crawler/request');
var Cache = require('./web-crawler/cache');
var PageScraper = require('./page-scraper/page-scraper');
var queryEngine = require('./engine/query-engine/queryengine');
var pageRank = require('./engine/text-processing/ranking');

var config = require('./config');


//pageRank.initPageRank(function (pages) {
//  pages = pageRank.pageRank(pages);
//  //console.log(pages);
//  pageRank.savePageRank(pageRank.pageRank(pages), function () {
//    console.log('page rank saved');
//  });
//});
//console.log(queryEngine.evaluate('факултет'));

//Cache.walkSync((a) => console.log(a));

//Crawler.crawlExternal(config.sites.starting);
//Crawler.crawlExternal(_.take(_.shuffle(WebCache.getPagesList()), 2));
Crawler.crawlOffline();
//Cache.walkWordIndex();
//Request.getPage('makfax.com.mk/ekonomija/makedonija/srpskite-turisti-s%D1%90-poveke-ja-posetuvaat-makedonija');




// probably deprecated
//var lineReader = require('readline').createInterface({
//  input: require('fs').createReadStream('_db/links.txt')
//});
//
//var links = [];
//lineReader.on('line', function (line) {
//  links.push(line);
//}).on('close', function () {
//  console.log(links);
//  require('fs').writeFileSync('_db/links.txt', JSON.stringify(links));
//});
