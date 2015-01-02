var brain = require("brain");

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
      var net = (name in networks) ? networks[name] : new brain.NeuralNetwork();
      networks[name] = net;
      try {
        //console.log(data);
        var res = networks[name].train(data, params);
        success(res, networks[name].toJSON());
      } catch(ex) {
        error(ex);
      }
    },
    // Run an already-trained network
    run: function(name, data, success, error) {
      if (!(name in networks)) {
        error("unknown network name: '"+name+"'");
      } else {
        success(networks[name].run(data));
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
      } else { // Creating from JSON
        if (!(name in networks)) {
          networks[name] = new brain.NeuralNetwork();
        }
        try {
          //console.log("Loading '"+name+"' from JSON");
          success(networks[name].fromJSON(data));
        } catch(ex) {
          error(ex);
        }
      }
    },
    deleteNetwork: function(name) {
      delete networks[name];
    }
  };
})();

module.exports = networkManager;

