var config = require("./config");
var log = require('llog');
var mongoose = require('mongoose');

mongoose.connect(config.mongoDB.url);

mongoose.connection.on('error', function (err) {
  log.error('MongoDB connection failed: ', err);
  throw err;
});

module.exports = mongoose;

