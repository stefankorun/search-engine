var db = require('../dbs/db-mongo').getInstance();

var search = function (query) {
  var words = query.split(' ');
  db.queryResults(words);
};

exports.search = search;