#!/usr/bin/env node

var express = require('express');
var app = express();
var fs = require('fs');
var yaml = require('js-yaml');
var bodyParser = require('body-parser');
var server = require('http').Server(app);
var mongo = require('mongodb').MongoClient;
var assert = require('assert');
var bunyan = require('bunyan');

// Local
var networkManager = require('./lib/networkManager.js');

// Set up logger
var logger = bunyan.createLogger({name:'parietal'});

//  Load config
var config = {};
try {
  config = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'));
} catch (e) {
  logger.error(e);
  process.exit(1);
}

// parse JSON POST requests
app.use(bodyParser.json());

// Initialize MongoDB connection
var db;
mongo.connect(config.mongoDBUrl, function(err, database) {
    assert.equal(null, err);
    db = database;
    db.collection(config.mongoDBCollection).find({}, {}).toArray(function(errorFind, items) {
      assert.equal(null, err);
      networkManager.init(items, function(err) {
        logger.error(err);
      });
    });
});

app.post('/api/networks/:id/train', function(request, response) {
  networkManager.train(request.params.id, request.body.data, request.body.params, 
    /* success */ function(res, trainedData) {
      db.collection(config.mongoDBCollection).update({name:request.params.id}, {name:request.params.id, data:trainedData}, {upsert:true}, function(err) {
        assert.equal(null, err);
        response.send(res); 
      });
    }, 
    /* error */ function(res) { 
      response.status(500).send(res); 
    });
});

app.post('/api/networks/:id/run', function(request, response) {
  networkManager.run(request.params.id, request.body.data, 
    /* success */ function(res) { 
      response.send(res); 
    }, 
    /* error */ function(res) { 
      response.status(500).send(res); 
    });
});

app.post('/api/networks/:id', function(request, response) {
  networkManager.create(request.params.id, request.body, 
    /* success */ function(res) { 
      response.send(res); 
    }, 
    /* error */ function(res) { 
      response.status(500).send(res); 
    });
});

app.get('/api/networks', function(request, response) {
  networkManager.list(
    /* success */ function(res) { 
      response.status(200).send(res); 
    });
});

app.get('/api/networks/:id', function(request, response) {
  networkManager.toJSON(request.params.id,
    /* success */ function(res) { 
      response.send(res); 
    }, 
    /* error */ function(res) { 
      response.status(500).send(res); 
    });
});

app.delete('/api/networks/:id', function(request, response) {
  networkManager.deleteNetwork(request.params.id);
  response.send({status:"ok"});
});

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send("An error has occurred.  My bad.");
});

app.use(express.static(__dirname + '/public'));

server.listen(config.port || 8100);



