function Documents(options){
  this.docList = [];
  this.docId = 0;
  this.length = 0;
}

Documents.prototype.addDocument = function (id, doc) {
  this.docId = id;
  this.docList.push(doc);
};

Documents.prototype.documents = function () {
  return this.docList;
};

module.exports = Documents;