var request = require('request');

var Memory = require('./memory');
var WebCrawler = require('./web-crawler/web-crawler');
var PageScraper = require('./page-scraper/page-scraper');
var queryEngine = require('./engine/query-engine/queryengine');
var pageRank = require('./engine/text-processing/ranking');

//console.log(WebCrawler, PageScraper, Memory);
//WebCrawler.crawlInternal('http://kajgana.com/', 2).then(function (result) {
//  console.log(result);
//});
//request.get({url: 'http://off.net.mk'}, function (error, response) {
//  //console.log(PageScraper.checkLanguage('mk_MK', response));
//  console.log(PageScraper.getBagOfWords(response));
//});

//pageRank.initPageRank(function (pages) {
//  pages = pageRank.pageRank(pages);
//  //console.log(pages);
//  pageRank.savePageRank(pageRank.pageRank(pages), function () {
//  });
//});
//console.log(queryEngine.evaluate('лаптоп'));

WebCrawler.crawlExternal('set.mk', 10);

