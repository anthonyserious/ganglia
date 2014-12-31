#!/usr/bin/env node

var express = require('express');
var app = express();
var fs = require('fs');
var yaml = require('js-yaml');
var bodyParser = require('body-parser');
var server = require('http').Server(app);
var brain = require("brain");
var net = brain.NeuralNetwork();

//  Load config
var config = {};
try {
  config = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'));
} catch (e) {
  console.log(e);
  process.exit(1);
}

// parse JSON POST requests
app.use(bodyParser.json());

// Simple pid file manager
var pidManager = (function() {
  var _path = "";
  return {
    removePidFile: function() {
      try {
        fs.unlinkSync(_path);
        return true;
      } catch (err) {
        return false;
      }
    },
    createPidFile: function(path, force) {
      _path = path;
      var pid = new Buffer(process.pid + '\n');
      var fd = fs.openSync(_path, force ? 'w' : 'wx');
      var offset = 0;

      while (offset < pid.length) {
          offset += fs.writeSync(fd, pid, offset, pid.length - offset);
      }
      fs.closeSync(fd);
    }
  }
})();

if (!fs.existsSync(config.logpath)) {
  fs.mkdirSync(config.logpath);
}
pidManager.createPidFile(config.logpath+"/ganglia.pid", true);

// Signal handler.  Remove pid file and exit cleanly.
function exitHandler() {
  pidManager.removePidFile();
  process.exit(0);
}

process.on('SIGTERM', exitHandler);
process.on('SIGINT', exitHandler);
process.on('exit', exitHandler);

//  Manage multiple networks here.
var networkManager = (function () {
  var networks = {};

  return {
    // Train a network
    train: function(name, data, params, success, error) {
      var net = (name in networks) ? networks[name] : new brain.NeuralNetwork();
      console.log("Training: '"+name+"'");
      networks[name] = net;
      try {
        console.log(data);
        var res = networks[name].train(data, params);
        success(res);
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
      success(JSON.stringify(Object.keys(networks)));
    },
    //  Send JSON for trained network
    toJSON: function(name, success, error) {
      if (name in networks) {
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
        console.log("New network created: '"+name+"'");
        success({status:"created"});
      } else { // Creating from JSON
        if (!(name in networks)) {
          networks[name] = new brain.NeuralNetwork();
        }
        try {
          console.log("Loading '"+name+"' from JSON");
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

app.post('/api/train/:id', function(request, response) {
  networkManager.train(request.params.id, request.body.data, request.body.params, 
    /* success */ function(res) { 
      response.send(res); 
    }, 
    /* error */ function(res) { 
      response.status(500).send(res); 
    });
});

app.post('/api/run/:id', function(request, response) {
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

server.listen(config.port || 8100);



