module.exports = {
  crawler: {
    externalLimit: 20,
    internalLimit: 1
  },
  sites: {
    excluded: [
      'wikipedia.org',
      'wikipedia.com',
      'twitter.com',
      'youtube.com',
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