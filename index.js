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
mongo.connect(config.mongoDB.url, function(err, database) {
    assert.equal(null, err);
    db = database;
    db.collection(config.mongoDB.networks).ensureIndex({name:true}, function(errorNetworkIndex, items) {
      assert.equal(null, errorNetworkIndex);
      db.collection(config.mongoDB.trainingData).ensureIndex({name:true}, function(errorTrainingDataIndex, items) {
        assert.equal(null, errorTrainingDataIndex);
        db.collection(config.mongoDB.networks).find({}, {}).toArray(function(errorFind, items) {
          assert.equal(null, errorFind);
          networkManager.init(items, function(err) {
            logger.error(err);
          });
        });
      });
    });
});

app.post('/api/networks/:id/train', function(request, response) {
  if (request.body.data != null && request.body.data.length > 0) {
    // Insert training data into database

    networkManager.train(request.params.id, request.body.data, request.body.params, 
      /* success */ function(res, trainedData) {
        db.collection(config.mongoDB.networks).update({name:request.params.id}, {name:request.params.id, data:trainedData}, {upsert:true}, function(err) {
          assert.equal(null, err);
          response.send({status:"ok", result:res}); 
        });
      }, 
      /* error */ function(res) { 
          response.status(500).send({status:"error", result:res}); 
        }
      );
  } else {
    db.collection(config.mongoDB.trainingData).find({name:request.params.id}, {data:true}).toArray(function(errorFind, items) {
      assert.equal(null, errorFind);
      if (items.length === 0) {
        response.status(500).send({status:"error", result:res});
      } else {
        var data = [];
        items.forEach(function(e) {
          data.push(e['data']);
        });
        networkManager.train(request.params.id, data, request.body.params,
          /* success */ function(res, trainedData) {
            response.send({status:"ok", result:res});
          },
          /* error */ function(res) {
            console.log("called");
            response.status(500).send({status:"error", result:res});
          }
        );
      }
    });
  }
});

app.post('/api/networks/:id/run', function(request, response) {
  networkManager.run(request.params.id, request.body.data, 
    /* success */ function(res) { 
      response.send({status:"ok", result:res});
    }, 
    /* error */ function(res) { 
      response.status(500).send({status:"error", result:res});
    });
});

app.post('/api/networks/:id', function(request, response) {
  networkManager.create(request.params.id, request.body, 
    /* success */ function(res) { 
      response.send({status:"ok", result:res});
    }, 
    /* error */ function(res) { 
      response.status(500).send({status:"error", result:res});
    });
});

app.get('/api/networks', function(request, response) {
  networkManager.list(
    /* success */ function(res) { 
      response.send({status:"ok", result:res});
    }); 
});

app.get('/api/networks/:id', function(request, response) {
  networkManager.toJSON(request.params.id,
    /* success */ function(res) { 
      response.send({status:"ok", result:res});
    }, 
    /* error */ function(res) { 
      response.status(500).send({status:"error", result:res});
    });
});

app.delete('/api/networks/:id', function(request, response) {
  networkManager.deleteNetwork(request.params.id);
  db.collection(config.mongoDB.networks).remove({name:request.params.id}, function(err) {
    if (err) {
      response.status(500).send({status:"error", result:res});
    } else {
      response.send({status:"ok"});
    }
  });
});

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send({status:"error", message:"Internal error occurred.  Sorry."});
});

// Manage training data
// Requests should be of the form [{input{}, output{}, ...]
app.post('/api/networks/:id/trainingdata', function(request, response) {
  var name = request.params.id;
  var dataArray = request.body.data;
  var batch = bulkOperation = db.collection(config.mongoDB.trainingData).initializeUnorderedBulkOp({useLegacyOps:true});

  dataArray.forEach(function(e) {
    bulkOperation.insert({name:name, data:e});
  })

  batch.execute(function(err, result) {
    if(err) { 
      logger.error(err); 
      response.status(500).send("Error during bulk operation: "+err);
    }
    assert.equal(dataArray.length, result.nInserted);
    response.send({status:"ok"});
  });
});

app.delete('/api/networks/:id/trainingdata', function(request, response) {
  db.collection(config.mongoDB.trainingData).remove({name:request.params.id}, function(err) {
    if (err) {
      response.status(500).send({status:"error", result:"Error during delete: "+err});
    } else {
      response.send({status:"ok"});
    }
  });

});
app.use(express.static(__dirname + '/public'));

server.listen(config.port || 8100);



