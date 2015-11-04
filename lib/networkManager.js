var brain = require("brain");
var log = require("llog");
var util = require("util");

//  Manage multiple networks here.
var networkManager = (function () {
  var networks = {};

  return {
    // Init - takes objects of the form {name, data}
    init: function(inputs, error) {
      log.debug("Initializing network manager.");
      inputs.forEach(function(e) {
        try {
          networks[e.name] = new brain.NeuralNetwork();
          networks[e.name].fromJSON(e.data);
        } catch(ex) {
          error(ex);
        }
      });
    },
    // Train a network
    train: function(name, data, params, success, error) {
      log.debug("Training " + name);
      if (!(name in networks)) {
        error("Network '"+name+"' is not defined");
      } else {
        var net = networks[name];
        networks[name] = net;
        try {
          var res = networks[name].train(data, params);
          success(res, networks[name].toJSON());
        } catch(ex) {
          console.log("Caught exception");
          error(ex);
        }
      }
    },
    // Run an already-trained network
    run: function(name, data, success, error) {
      log.debug("Running " + name);
      if (!(name in networks)) {
        error("Network '"+name+"' is not defined");
      } else { 
        try {
          log.debug("name: " + name + ", data: " + util.inspect(data));
          console.log(util.inspect(networks[name].toJSON()));
          var res = networks[name].run(data);
          success(res);
        } catch(ex) {
          log.error("Error while running " + name);
          error(ex);
        }
      }
    },
    //  List all available networks
    list: function(success) {
      log.debug("Listing networks");
      success(Object.keys(networks));
    },
    //  Send JSON for trained network
    toJSON: function(name, success, error) {
      log.debug("Getting JSON for " + name);
      if (!(name in networks)) {
        error("unknown network name: '"+name+"'");
      } else {
        success(networks[name].toJSON());
      }
    },
    //  Load JSON representation of an already-trained network
    create: function(name, data, success, error) {
      log.debug("Creating network " + name + " with data: " + util.inspect(data));

      if ("options" in data) {
        if (name in networks) {
          delete networks[name];
        }
        
        networks[name] = new brain.NeuralNetwork(data.options);
        
        log.debug("New network created: '"+name+"'");
        success(null);
      /* fromJSON() is not working in brain.js.  Skip this block.
      } else if ("layers" in data) { // Creating from JSON
        console.log("Creating from json: " + util.inspect(data));
        
        if (!(name in networks)) {
          networks[name] = new brain.NeuralNetwork();
        }

        try {
          log.debug("Creating '"+name+"' from JSON");
          networks[name] = new brain.NeuralNetwork();
          networks[name].fromJSON(data);
          success(data);
        } catch(ex) {
          log.error("Error while loading " + name + " from JSON");
          error(ex);
        }
      */
      } else {
        networks[name] = new brain.NeuralNetwork();
        success(null)
      }
    },
    deleteNetwork: function(name, error) {
      log.debug("Deleting network " + name);
      delete networks[name];
    }
  };
})();

module.exports = networkManager;

