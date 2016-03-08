exports.seCfg = {
  DOCUMENTS_DIR: '../documents',
  LANGUAGE_THRESHOLD: 0.6
};

// MongoDB config
exports.db = {
  USER: '',
  PASS: '',
  PORT: 27017,
  DB_NAME: 'search-engine-3',
  HOST: '127.0.0.1',
  URL: 'mongodb://localhost:27017/search-engine-3',
  COLLECTIONS: {
    URLS: 'urls',
    CONFIG: 'config',
    WORDS: 'words',
    INDEX: 'word-index',
    PAGE_RANK: 'ranking',
    PAGES: 'domains'
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
  DUMPING_FACTOR: 0.75,
  ITERATIONS: 20
};