var request = require('request');

var api = module.exports;

api.getPage = function (url, cb) {
  url = 'http://' + encodeURI(url);
  console.log('getPage:', url);
  try {
    request.get({uri: url, timeout: 5000, maxRedirects: 5}, (err, response) => {
      if(err) cb(err, null);
      else if(response.headers['content-type'] && response.headers['content-type'].indexOf('text/html') > -1) cb(err, response);
      else cb(err, response);
    });
  } catch (ex) {
    cb(ex, null);
  }
};