var brain = require("brain");
var util = require("util");

//  Manage multiple networks here.
var networkManager = (function () {
  var networks = {};

  return {
    // Init - takes objects of the form {name, data}
    init: function(inputs, error) {
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
      if (!(name in networks)) {
        error("Network '"+name+"' is not defined");
      } else { 
        try {
          var res = networks[name].run(data);
          success(res);
        } catch(ex) {
          error(ex);
        }
      }
    },
    //  List all available networks
    list: function(success) {
      success(Object.keys(networks));
    },
    //  Send JSON for trained network
    toJSON: function(name, success, error) {
      if (!(name in networks)) {
        error("unknown network name: '"+name+"'");
      } else {
        success(networks[name].toJSON());
      }
    },
    //  Load JSON representation of an already-trained network
    create: function(name, data, success, error) {
      if ("options" in data) {
        if (name in networks) {
          delete networks[name];
        }
        networks[name] = new brain.NeuralNetwork(data.options);
        //console.log("New network created: '"+name+"'");
        success({status:"created"});
      } else if ("layers" in data) { // Creating from JSON
        if (!(name in networks)) {
          networks[name] = new brain.NeuralNetwork();
        }
        try {
          //console.log("Loading '"+name+"' from JSON");
          success(networks[name].fromJSON(data));
        } catch(ex) {
          error(ex);
        }
      } else {
        networks[name] = new brain.NeuralNetwork();
        success("Network '"+name+"' created");
      }
    },
    deleteNetwork: function(name, error) {
      // TODO  delete from mongodb.
      delete networks[name];
    }
  };
})();

module.exports = networkManager;

