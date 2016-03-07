var crypto = require('crypto');
var fse = require('fs-extra');


exports.savePage = function (domain, url, response) {
  var hash = crypto.createHash('md5').update(url).digest('hex');

  fse.ensureDir('_db/page-cache/' + domain, function (err) {
    fse.writeFile(
      '_db/page-cache/' + domain + '/' + hash,
      url + '\n' + response
    );
  })
};
exports.getPage = function () {

};

function createFolder() {

}