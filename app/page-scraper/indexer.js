class BagOfWords {
  constructor(wordsList) {
    this.items = wordsList || {};
    this.length = Object.keys(wordsList).length;
  }

  getItem(word) {
    return this.hasItem(word) ? this.items[word] : undefined;
  }
  hasItem(word) {
    return this.items.hasOwnProperty(word);
  }
  addItem (word) {
    if (this.hasItem(word)) {
      this.items[word] += 1;
    } else {
      this.items[word] = 1;
    }
  }
  removeItem (word) {
    if (this.hasItem(word)) {
      delete this.items[word];
      this.length--;
      return true;
    }
    return false;
  };
}

function BagOfWords(wordsList, length, options) {
  this.items = wordsList || {}; // {} || new Object()
  this.length = length || 0;
}

BagOfWords.prototype.getItem = function (word) {

};

BagOfWords.prototype.hasItem = function (word) {

};

BagOfWords.prototype.addItem = function (word) {
  if (this.hasItem(word)) {
    this.items[word] += 1;
  }
  else {
    this.items[word] = 1;
    this.length++;
  }
  return true;
};

BagOfWords.prototype.removeItem = function (word) {
  if (this.hasItem(word)) {
    delete this.items[word];
    this.length--;
    return true;
  }
  return false;
};

BagOfWords.prototype.words = function () {
  var keys = [];
  for (var word in this.items) {
    keys.push(word);
  }
  return keys;
};

BagOfWords.prototype.values = function () {
  var values = [];
  for (var word in this.items) {
    values.push(this.items[word]);
  }
  return values;
};

BagOfWords.prototype.each = function (fn) {
  var index = 0;
  for (var word in this.items) {
    fn(word, this.items[word], index);
    index++;
  }
};

BagOfWords.prototype.clear = function () {
  this.items = {};
  this.length = 0;
};

module.exports = BagOfWords;
