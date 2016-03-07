var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase('http://localhost:7474');



/*var node = db.createNode({hello: 'kasper'});     // instantaneous, but...
node.save(function (err, node) {    // ...this is what actually persists.
  if (err) {
    console.error('Error saving new node to database:', err);
  } else {
    console.log('Node saved to database with id:', node.id);
  }
});*/

var query = 'CREATE (n:Url {url: "V"}) RETURN n';

/*var query = [
  'MATCH (user:User)',
  'RETURN user',
].join('\n');*/

var params = {
  data: {name: 'Ivanwa'}
};

db.query(query, function (err, result) {
  if(err){
    console.log("error");
    console.log(err);
  }
  else{
    console.log(result);
  }
});