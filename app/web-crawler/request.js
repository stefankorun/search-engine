var request = require('request');

var api = module.exports;

api.getPage = function (url, cb) {
  url = 'http://' + (decodeURI(url) === url ? encodeURI(url) : url);
  console.log('getPage:', url);
  try {
    request.get({uri: url, timeout: 5000, maxRedirects: 5}, (err, response) => {
      if(err) cb(err, null);
      else cb(err, response);
    });
  } catch (ex) {
    cb(ex, null);
  }
};