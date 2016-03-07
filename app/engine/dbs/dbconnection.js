var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var dbCfg = require('../config/config').db;
var MongoClient = require('mongodb').MongoClient;
var db_singleton = null;

//TODO ne mi trebit ova....

var getConnection = function getConnection(callback)
{

    if (db_singleton)
    {
        callback(null,db_singleton);
    }
    else
    {
        var connURL = dbCfg.URL;
        setTimeout(MongoClient.connect(connURL,function(err,db){
            if(err)
                console.log("Error creating new connection "+err);
            else
            {
                db_singleton=db;
                console.log("created new connection");

            }
            callback(err,db_singleton);
            return;
        }), 3000);
    }
}

module.exports = getConnection;
