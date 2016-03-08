// requires
var Promise = require("bluebird");
//var request = require('request');
var async = require('async');
var _ = require('lodash');
var fs = require('fs');

var config = require('../config');
var Memory = require('../memory');
var Cache = require('./cache');
var Request = require('./request');
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
api.crawlOffline = function () {
  var urls = JSON.parse(fs.readFileSync(config.database.pagesList));
  async.eachSeries(urls, (url, callback) => {
    if (!Cache.hasWordIndex(url)) {
      api.crawlInternal(url).then((data) => {
        console.log('saving word index');
        Cache.saveWordIndex(url, data);
        callback(null);
      })
    } else {
      callback(null);
    }
  }, function done() {
    console.log('done');
  });
};
api.crawlExternal = function (urls) {
  var searchIndex = new Index();
  dbGraph.clearGraph(new Function());
  var result = {};


  crawlRecursive(_.isArray(urls) ? urls : [urls], config.crawler.externalLimit);
  function crawlRecursive(urls, limit) {
    console.log('\nEXTERNAL level %d \ntotal urls: %d\n', limit, urls.length);
    var external = [];
    urls = _.uniq(urls);
    urls = _.difference(urls, _.keys(result));
    urls = _.differenceWith(urls, config.sites.excluded, (s1, s2) => {
      return ~s1.indexOf(s2);
    });

    async.eachSeries(urls, function (url, callback) {
      Request.getPage(url, function (error, response) {
        if (PageScraper.checkLanguage('mk_MK', response)) {
          api.crawlInternal(url).then(function (data) {
            result[url] = _.omit(data, 'words');
            external = _.union(external, data.external);

            var bagOfWords = new BagOfWords();
            _.each(data.words, (word) => {
              bagOfWords.addItem(word);
            });
            searchIndex.addData(url, bagOfWords);
            searchIndex.saveToDatabase(new Function());
            dbMongo.insertUrl(url, new Function());
            dbGraph.create(url, data.external, new Function());

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
            pageRank.savePageRank(pageRank.pageRank(pages), new Function());
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
    urls = _.filter(urls, url => url.match(config.sites.excluded.extensions) === null)
    ;
    urls = _.difference(urls, pages.visited);
    urls = _.take(urls, 200);
    console.log('\nINTERNAL level %d \ntotal urls: %d\n', limit, urls.length);

    throttleRequests(urls).then(function (data) {
      pages.visited = _.union(pages.visited, urls);

      var links = _.reduce(data, function (result, d) {
        Cache.savePage(d.response.request.host.replace(/www\./g, ''), d.url, d.response.body);

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
  var threshold = 20;
  var responses = [];

  async.eachLimit(urls, threshold, function (url, callback) {
    Request.getPage(url, function (err, res) {
      if (!err) {
        responses.push({
          url: url,
          response: res
        });
      }
      callback(null);
    });
  }, function done() {
    deferred.resolve(responses);
  });
  return deferred.promise;
}