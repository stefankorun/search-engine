var db = require('../dbs/db-manager').getInstance();

var evaluate = function (query) {
  var words = query.split(' ');
  db.queryResults(words);
};

exports.evaluate = evaluate;