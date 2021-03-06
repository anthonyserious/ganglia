var async = require("async");
var bodyParser = require('body-parser');
var express = require('express');
var JSONStream = require("JSONStream");
var log = require("llog");
var Network = require("../lib/models/network");
var networkManager = require("../lib/networkManager");
var router = express.Router();
var TrainingData = require("../lib/models/trainingData");

router.get('/:_id/trainingdata', function (req, res, next) {
  var _id = req.param._id;

  res.type('json');
  TrainingData.findOne({ name: _id }).lean().stream().pipe(JSONStream.stringify(false)).pipe(res);
});

router.delete('/:id/trainingdata', function(req, res) {
  log.debug("Deleting trainingdata");

  TrainingData.remove({name: req.param.id}, function(err) {
    res.type("json");
    if (err) {
      res.status(500).send({ status: "error", result:res });
    } else {
      res.send({ status: "ok" });
    }
  });
});


router.post('/:id', function(req, res) {
  log.debug("Creating network");

  res.type("json");
  networkManager.create(req.params.id, req.body, 
    /* success */ function(result) {
      if (result) {
        log.debug("Saving network to database");
        Network.update({name: req.params.id }, { name: req.params.id, data: result}, { upsert: true }, function(err) {
          if (err) {
            res.status(500).send({ status: "error", result: err });
          } else {
            res.send({status: "ok", result: result});
          }
        })
      } else {
        log.debug("New empty network created");
        res.send({status: "ok", result: "Successfully created"});
      }
    }, 
    /* error */ function(result) { 
      res.status(500).send({status: "error", result: result});
    });
});

router.post('/:id/train', function(req, res) {
  console.log("Training ...");
  log.debug("Training network");

  res.type("json");
  if (req.body.data != null && req.body.data.length > 0) {
    // Insert training data into database
    var trainingData = req.body.data;

    networkManager.train(req.params.id, req.body.data, req.body.params, 
      /* success */ function(result, trainedData) {
        Network.update({name: req.params.id }, { name: req.params.id, data: trainedData }, { upsert: true }, function(err) {
          if (err) {
            res.status(500).send({ status: "error", result: err });
          } else {
            TrainingData.remove({ name: req.param.id }, function(err) {
              if (err) {
                res.status(500).send({ status: "error", result: err });
              } else {
                async.each(req.body, function(d, cb) {
                  var trainingData = new TrainingData();
                  trainingData.save(req.body, cb);
                }, function(err) {
                  if (err) {
                    res.status(500).send({ status: "error", result: err });
                  } else {

                    res.send({status:"ok", result:result});
                  }
                });
              }
            });
          }
        });
      }, 
      /* error */ function(res) { 
          res.status(500).send({ status: "error", result: res }); 
        }
      );
  } else {
    res.status(500).send({ status: "error", result: "No training data provided" }); 
  }
});

router.post('/:id/run', function(req, res) {
  log.debug("Running network");

  res.type("json");
  networkManager.run(req.params.id, req.body.data, 
    /* success */ function(result) { 
      res.send({ status: "ok", result: result});
    }, 
    /* error */ function(result) { 
      res.status(500).send({ status: "error", result: result});
    });
});

router.delete('/:id', function(req, res) {
  log.debug("Deleting network");

  networkManager.deleteNetwork(req.params.id);
  
  res.type("json");
  Network.remove({name: req.params.id}, function(err) {
    if (err) {
      res.status(500).send({ status: "error", result: res });
    } else {
      res.send({ status: "ok" });
    }
  });
});

router.get('/:id', function (req, res, next) {
  log.debug("Requesting network");

  res.type('json');
  Network.findOne({ name: req.params.id }, function(err, result) {
    if (err) {
      res.status(500).send({ status: "error", result:res });
    } else {
      res.send({ status: "ok", result: result });
    }
  })
});

router.get('/', function(req, res) {
  log.debug("Requesting /");

  res.type("json");
  networkManager.list(
    /* success */ function(result) { 
      res.send({ status: "ok", result: result});
    }); 
});



module.exports = router;

