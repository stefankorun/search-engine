// Application config
//['http://moebebe.com.mk', 'http://www.ringeraja.mk', 'http://time.mk', 'http://ohridnews.com']
exports.seCfg = {
  START_PAGES: [
    {url: 'http://kadevecer.com.mk', done: false, docID: 0, pr: 1},
    {url: 'http://duna.mk', done:false, docID: 0, pr: 1}
  ],
  DOCUMENTS_DIR: '../documents',
  LANGUAGE_THRESHOLD: 0.6
};

// MongoDB config
exports.db = {
  USER: '',
  PASS: '',
  PORT: 27017,
  DB_NAME: 'sedb',
  HOST: '127.0.0.1',
  URL: 'mongodb://localhost:27017/sedb',
  COLLECTIONS: {
    URLS: 'urls',
    CONFIG: 'config',
    WORDS: 'words',
    INDEX: 'index',
    PAGE_RANK: 'page_rank'
  }
};

exports.graphdb = {
  USER: 'neo4j',
  PASS: 'seminarska',
  PORT: 7474,
  HOST: 'localhost',
  URL: 'http://neo4j:seminarska@localhost:7474'
};

exports.crawler = {
  MAX_PAGE_LEVEL: 3,
  MAX_PAGE_REQUESTS: 40
};

exports.pageRank = {
  DUMPING_FACTOR: 0.85,
  ITERATIONS: 12
};