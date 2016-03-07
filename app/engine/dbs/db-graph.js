var neo4j = require('neo4j'),
    config = require('../config/config').graphdb;
    db = new neo4j.GraphDatabase(config.URL),
    _ = require('lodash');

var grNodes = [];

create = function(rootNode, nodes, cb){
  if(nodes.length == 0){
    var mQuery = buildMatchQuery([rootNode]);
    db.query(mQuery, function (err, result) {
      if(err){
        console.log("Error match querysss.");
        console.log(err.message.errors);
      }
      else{
        if(result.length === 0){
          var cQuery = buildCreateQuery([rootNode]);
          db.query(cQuery, function (err, result) {
            if(err){
              console.log('Error creating graph query.');
              console.log(err);
            }
            else{
              cb(null);
            }
          });
        }
        else{
          cb(null);
        }
      }
    });
  }
  else{
    nodes.push(rootNode);
    var mQuery = buildMatchQuery(nodes);
    console.log(mQuery);
    db.query(mQuery, function (err, result) {
      console.log("Match query done", 'yeyey');
      //
      if(err){
        console.log("Error match query..");
        console.log(err);
        cb(err);
      }
      else {
        console.log("1. " + nodes.length + ", " + result.length);
        //
        console.log(result)
        for (var i = 0; i < result.length; i++) {
          console.log(result[i].n.data.url);
        }
        var resNodes = [];
        for (var i = 0; i < result.length; i++) {
          resNodes.push(result[i].n.data.url);
        }
        console.log(resNodes, 'sdfsdf')
        var difNodes = nodes;
        if (result.length != 0) {
          difNodes = _.difference(nodes, resNodes);
        }
        console.log("2. " + difNodes.length);
        //
        var cQuery = buildCreateQuery(difNodes);
        console.log(cQuery)
        db.query(cQuery, function (err, result) {
          console.log("Create query done");
          if (err) {
            console.log('Error creating graph query.');
            console.log(err);
            cb(err);
          }
          else {
            nodes.pop();
            var fQuery = createRelations(rootNode, nodes);
            console.log("3....");
            db.query(fQuery, function (err, result) {
              console.log("Relationships query done");
              if (err) {
                console.log('Error creating graph relations.');
                console.log(err);
                cb(err);
              }
              else {
                console.log('Inserted in graph.');
                cb(null);
              }
            });
          }
        });
      }
    });
  }
};

createGraph = function (rootNode, nodes, cb) {

  if(nodes.length == 0){
    db.query("CREATE ({url: "+rootNode+"})", function () {
      cb(null);
    });
    return;
  }

  nodes.push(rootNode);
  var mQuery = buildMatchQuery(nodes);
  console.log(mQuery);
  db.query(mQuery, function (err, result) {
    if(err){
      console.log("Error match query.");
      console.log(err.message.errors);
    }
    else{
      console.log("1. " + nodes.length + ", " + result.length);
      //
      if(nodes.length != result.length){
        var resNodes = [];
        for(var i = 0; i < result.length; i++){
          resNodes.push(result[i].n.data.url);
        }
        var difNodes = _.difference(nodes, resNodes);
        console.log("2. " + difNodes.length);
        //
        var cQuery = buildCreateQuery(difNodes);
        db.query(cQuery, function (err, result) {
          if(err){
            console.log('Error creating graph query.');
            console.log(err);
          }
          else{
            nodes.pop();
            if(nodes.length != 0) {
              var fQuery = createRelations(rootNode, nodes);
              db.query(fQuery, function (err, result) {
                if (err) {
                  console.log('Error creating graph relations.');
                  console.log(err);
                  cb(err);
                }
                else {
                  console.log('Inserted in graph.');
                  cb(null);
                }
              });
            }
            cb(null);
          }
        });
      }
      else{
        nodes.pop();
        if(nodes.length != 0) {
          var fQuery = createRelations(rootNode, nodes);
          db.query(fQuery, function (err, result) {
            if (err) {
              console.log('Error creating graph relations.');
              console.log(err);
              cb(err);
            }
            else {
              console.log('Inserted in graph.');
              cb(null);
            }
          });
        }
        cb(null);
      }
    }
  });
};

buildMatchQuery = function (nodes) {
  var query = 'MATCH (n) WHERE ';
  for(var i = 0; i < nodes.length - 1; i++){
    query = query.concat('n.url = "' + nodes[i] + '" OR ')
  }
  query = query.concat('n.url = "' + nodes[nodes.length - 1] + '"');
  query = query.concat(' RETURN n');
  return query;
};

buildCreateQuery = function (nodes) {
  var query = 'CREATE ';
  for(var i = 0; i < nodes.length - 1; i++){
    query = query.concat('({url: "' + nodes[i] + '"}), ');
  }
  query = query.concat('({url: "' + nodes[i] + '"})');
  return query;
};

createRelations = function (rootNode, nodes) {
  var mQuery = 'MATCH (rn),';
  var wQuery = 'WHERE rn.url="'+rootNode+'" AND ';
  var cQuery = 'CREATE ';
  for(var i = 0; i < nodes.length - 1; i++){
    mQuery = mQuery.concat('(a' + i + '),');
    wQuery = wQuery.concat('a'+i+'.url="' + nodes[i] + '" AND ');
    cQuery = cQuery.concat('(rn)-[r'+i+':POINTSTO]->(a'+i+'),');
  }
  mQuery = mQuery.concat('(a' + i + ') ');
  wQuery = wQuery.concat('a'+i+'.url="' + nodes[i] + '" ');
  cQuery = cQuery.concat('(rn)-[r'+i+':POINTSTO]->(a'+i+') ');
  var query = mQuery + wQuery + cQuery;
  return query;
};

inNodes = function (url, index, callback) {
  var query = "MATCH (a)-[p:POINTSTO]->(b {url: '"+url+"'}) RETURN a";
  db.query(query, function (err, result) {
    if(err){
      callback(err, null);
    }
    else{
      callback(err, result, index);
    }
  });
};

numOutLinks = function (url, index, callback) {
  var query = 'MATCH (a {url: "'+url+'"})-[p:POINTSTO]->(b) RETURN count(b) as count';
  db.query(query, function (err, result) {
    if(err){
      callback(err, null);
    }
    else{
      callback(err, {index: index, count: result[0].count});
    }
  });
};

deleteNode = function (url, callback) {
  var query = 'MATCH (n { url: "'+url+'" })-[r]-() DELETE n, r';
  db.query(query, function (err, result) {
    if(err){
      callback(err, null);
    }
    else{
      callback(err, true);
    }
  })
};

exports.deleteNode = deleteNode;
exports.grNodes = grNodes;
exports.createGraph = createGraph;
exports.inNodes = inNodes;
exports.numOutLinks = numOutLinks;
exports.create = create;

