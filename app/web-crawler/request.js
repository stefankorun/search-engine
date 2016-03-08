var request = require('request');

var api = module.exports;

api.getPage = function (url, cb) {
  try {
    url = 'http://' + (decodeURI(url) === url ? encodeURI(url) : url);
  } catch (ex) {
    cb(ex, null);
    return;
  }
  console.log('getPage:', url);
  request.get({uri: url, timeout: 5000, maxRedirects: 5}, cb);
};