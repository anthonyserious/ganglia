#!/usr/bin/env node

var express = require('express');
var app = express();
var fs = require('fs');
var yaml = require('js-yaml');
var bodyParser = require('body-parser');
var server = require('http').Server(app);

// Local
var networkManager = require('./lib/networkManager.js');

//  Load config
var config = {};
try {
  config = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'));
} catch (e) {
  log.error(e);
  process.exit(1);
}

app.use(function(err, req, res, next) {
  console.log("error?");
  log.error(err.stack);
  res.status(500).send({ status: "error", message: "Internal error occurred.  Sorry." });
});
console.log("hey");

app.get('/', function(req, res) {
  console.log("ascasc");
  res.status(200).send({ status: "ok" });
});

app.use(bodyParser.json());
app.use('/api/network', require('./routes/network'));

server.listen(config.port || 8100);



