// requires
var Promise = require("bluebird");
var request = require('request');
var async = require('async');
var _ = require('lodash');
var fs = require('fs');

var config = require('../config');
var Memory = require('../memory');
var WebCache = require('./web-cache');
var PageScraper = require('../page-scraper/page-scraper');

var BagOfWords = require('../engine/text-processing/bagofwords');
var Index = require('../engine/text-processing/index');
var dbGraph = require('../engine/dbs/db-graph');
var dbMongo = require('../engine/dbs/db-manager').getInstance();
var pageRank = require('../engine/text-processing/ranking');
var queryEngine = require('../engine/query-engine/queryengine');

var api = {};
module.exports = api;

// public
api.crawlExternal = function (urls) {
  var searchIndex = new Index();
  dbGraph.clearGraph(new Function());
  var result = {};

  crawlRecursive(_.isArray(urls) ? urls : [urls], config.crawler.externalLimit);
  function crawlRecursive(urls, limit) {
    console.log('\nEXTERNAL LEVEL %d \nTOTAL URLS: %d\n', limit, urls.length);
    var external = [];
    urls = _.uniq(_.difference(urls, _.keys(result)));
    urls = _.differenceWith(urls, config.sites.excluded, (s1, s2) => {
      return ~s1.indexOf(s2);
    });

    async.eachSeries(urls, function (url, callback) {
      request.get({uri: url}, function (error, response) {
        if (PageScraper.checkLanguage('mk_MK', response)) {
          api.crawlInternal(url).then(function (data) {
            result[url] = _.omit(data, 'words');
            external = _.union(external, data.external);

            var bagOfWords = new BagOfWords();
            _.each(data.words, (word) => {
              bagOfWords.addItem(word);
            });
            searchIndex.addData(url, bagOfWords);
            searchIndex.saveToDatabase(() => {
              console.log('saved');
            });
            dbMongo.insertUrl(url, () => {
            });
            dbGraph.create(url, data.external, (err) => {
            });

            callback(null);
          })
        } else {
          console.log('NOT A mk_MK site', url);
          callback(null);
        }
      })
    }, function done() {
      if (limit === 0) {
        searchIndex.saveToDatabase(function () {
          console.log('done index');
          pageRank.initPageRank(function (pages) {
            pages = pageRank.pageRank(pages);
            //console.log(pages);
            pageRank.savePageRank(pageRank.pageRank(pages), function () {
            });
          });
        });
        return result;
      } else {
        crawlRecursive(external, limit - 1)
      }
    });
  }
};

api.crawlInternal = function (url) {
  var deferred = Promise.defer();
  var pages = {
    external: [],
    internal: [],
    visited: [],
    words: []
  };

  crawlRecursive([url], config.crawler.internalLimit);
  function crawlRecursive(urls, limit) {
    console.log('\nINTERNAL LEVEL %d \nTOTAL URLS: %d\n', limit, urls.length);

    urls = _.difference(urls, pages.visited);
    throttleRequests(urls).then(function (data) {
      pages.visited = _.union(pages.visited, urls);

      var links = _.reduce(data, function (result, d) {
        WebCache.savePage(d.response.request.host, d.url, d.response.body);

        var responseLinks = PageScraper.getLinks(d.response);
        var contentWords = PageScraper.getContent(d.response);
        result.internal = _.union(result.internal, responseLinks.internal);
        result.external = _.union(result.external, responseLinks.external);
        result.words = result.words.concat(contentWords); //todo: refactor
        return result;
      }, {internal: [], external: [], words: []});

      // add to global result
      pages.external = _.union(pages.external, links.external);
      pages.internal = _.union(pages.internal, links.internal);
      pages.words = pages.words.concat(links.words);

      if (limit === 0) {
        deferred.resolve(pages);
      } else {
        crawlRecursive(links.internal, limit - 1);
      }
    });
  }

  return deferred.promise;
};

// private
function throttleRequests(urls) {
  var deferred = Promise.defer();
  var threshold = 50;
  var responses = [];

  async.eachLimit(urls, threshold, function (url, callback) {
    console.log('request to:', url);
    try {
      request.get({uri: url, timeout: 2000, maxRedirects: 5}, function (err, res) {
        if (!err) {
          responses.push({
            url: url,
            response: res
          });
        }
        callback(null);
      });
    } catch (ex) {
      callback(null);
    }
  }, function done() {
    deferred.resolve(responses);
  });
  return deferred.promise;
}