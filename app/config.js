module.exports = {
  database: {
    wordsCache: '_db/words-cache/',
    pagesCache: '_db/page-cache/',
    pagesList: 'web-crawler/links.json'
  },
  crawler: {
    externalLimit: 20,
    internalLimit: 2
  },
  sites: {
    starting: [
      'femina.mk',
      //'off.net.mk',
      //'kajgana.com',
      //'time.mk',
      //'grid.mk',
      //'sport.com.mk',
      //'ohridnews.com'
    ],
    excluded: [
      'wikipedia.org',
      'wikipedia.com',
      'twitter.com',
      'mapas.mk',
      'youtube.com',
      'youtu.be',
      'facebook.com',
      'buzzfeed.com',
      'markukule.mk',
      'imdb.com'
    ]
  },
  languages: {
    _threshold: 1,
    mk_MK: {
      specialChars: ['љ', 'џ', 'ѓ', 'ќ', 'њ'],
      keywords: []
    }
  }
};