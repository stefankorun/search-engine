var crypto = require('crypto');
var path = require('path');
var fse = require('fs-extra');
var _ = require('lodash');

var config = require('../config');

var pagesCache = config.database.pagesCache;
var wordsCache = config.database.wordsCache;

var api = module.exports;

api.saveWordIndex = function (domain, data) {
  var hash = crypto.createHash('md5').update(domain).digest('hex');

  fse.writeFile(
    path.join(wordsCache, hash),
    JSON.stringify({
      domain: domain,
      data: data
    })
  );
};
api.hasWordIndex = function (domain) {
  var hash = crypto.createHash('md5').update(domain).digest('hex');

  return fse.existsSync(path.join(wordsCache, hash));
};
api.walkWordIndex = function (callback) {
  var files = getFiles(wordsCache);
  _.each(files, (f)=> {
    var data = JSON.parse(fse.readFileSync(path.join(wordsCache, f)));
    callback(data);
  });

  function getFiles(src) {
    return fse.readdirSync(src).filter(function (file) {
      return fse.statSync(path.join(src, file)).isFile();
    });
  }
};


api.savePage = function (domain, url, response) {
  var hash = crypto.createHash('md5').update(url).digest('hex');

  fse.ensureDir(pagesCache + domain, function (err) {
    fse.writeFile(
      pagesCache + domain + '/' + hash,
      url + '\n' + response
    );
  })
};
api.getPage = function () {

};
api.hasPage = function (domain) {
  return this.getPagesList().indexOf(domain) > -1;
};
api.getPagesList = function () {
  return getDirectories(pagesCache);

  function getDirectories(src) {
    return fse.readdirSync(src).filter(function (file) {
      return fse.statSync(path.join(src, file)).isDirectory();
    });
  }
};
api.walkSync = _.partial(walkSync, pagesCache);

function walkSync(basePath, callback) {
  fse.readdirSync(basePath).forEach(function (name) {
    var filePath = path.join(basePath, name);
    if (fse.statSync(filePath).isFile()) {
      callback(filePath);
    } else if (fse.statSync(filePath).isDirectory()) {
      walkSync(filePath, callback);
    }
  });
}
