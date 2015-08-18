var wc = require('./web-crawler/web-crawler');
var ps = require('./page-scraper/page-scraper');


//wc.getLinks(['http://off.net.mk/']);
ps.findContentDiv([
  'http://www.time.mk/'
]);