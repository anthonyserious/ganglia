//  Load config
var fs = require("fs");
var log = require("llog");
var yaml = require("js-yaml");

var config = {};

try {
  config = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'));
} catch (e) {
  log.error(e);
  process.exit(1);
}

module.exports = config;


