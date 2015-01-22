var superagent = require('superagent');
var expect = require('expect.js');
var yaml = require('js-yaml');
var fs = require('fs');

//  Load config
var config = {};
try {
  config = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'));
} catch (e) {
  console.log(e);
  process.exit(1);
}
var baseUrl = "http://localhost:"+config.port;
console.log("Using baseUrl "+baseUrl);

//  This will be used for extracting an already-trained network and then creating it again.
var savedJson = {};

// Need a unique network name to test with.
var networkName = "xor-"+process.pid;

describe('Parietal REST API server', function() {

  //  First test is on a newly initialized server.  The list of networks should no contain networkName.
  it('get list of networks, which should not contain our network name', function(done){
    superagent.get(baseUrl+'/api/networks')
      .end(function(e,res){
        //console.log(res.body);
        expect(e).to.eql(null);
        expect(typeof res.body).to.eql("object");
        expect(res.body.result).not.to.contain(networkName);
        done();
      });
  });

  //  Call "train" for a new network called "xor".  This should automatically create and train the network.
  it('create network', function(done){
    superagent.post(baseUrl+"/api/networks/"+networkName)
      .end(function(e,res){
        expect(typeof res.body).to.eql("object");
        done();
      });
  });

  //  Call "train" for a new network called "xor".  This should automatically create and train the network.
  it('add training data', function(done){
    superagent.post(baseUrl+"/api/networks/"+networkName+"/trainingdata")
      .send({data:[{input: [0, 0], output: [0]}, {input: [0, 1], output: [1]}, {input: [1, 0], output: [1]}, {input: [1, 1], output: [0]}]})
      .end(function(e,res){
        expect(typeof res.body).to.eql("object");
        expect(res.body.status).to.eql("ok");
        done();
      });
  });

  //  Call "train" for a new network called "xor".  This should automatically create and train the network.
  it('train network', function(done){
    superagent.post(baseUrl+"/api/networks/"+networkName+"/train")
      .end(function(e,res){
        expect(typeof res.body).to.eql("object");
        expect(res.body.result.error).to.be.below(0.01);
        expect(res.body.result.iterations).to.be.above(1);
        done();
      });
  });

  //  Query list of networks again.  Should contain only "xor" now.
  it('get list of networks with only xor', function(done){
    superagent.get(baseUrl+"/api/networks")
      .end(function(e,res){
        //console.log(res.body);
        expect(e).to.eql(null);
        expect(typeof res.body).to.eql("object");
        expect(res.body.result).to.contain(networkName);
        done();
      });
  });

  // Test with [0, 1].  Use a very forgiving threshold since we're not testing brain.js here but rather the API.
  it('Run XOR network on [0, 1]', function(done){
    superagent.post(baseUrl+"/api/networks/"+networkName+"/run")
      .send({data:[0,1]})
      .end(function(e,res){
        expect(e).to.eql(null);
        expect(typeof res.body.result).to.eql("object");
        expect(res.body.result.length).to.be(1);
        expect(res.body.result[0]).to.be.above(0.7);
        done();
      });
  });
  
  // Test with [0, 0].  Use a very forgiving threshold since we're not testing brain.js here but rather the API.
  it('Run XOR network on [0, 0]', function(done){
    superagent.post(baseUrl+"/api/networks/"+networkName+"/run")
      .send({data:[0,0]})
      .end(function(e,res){
        expect(e).to.eql(null);
        expect(typeof res.body.result).to.eql("object");
        expect(res.body.result.length).to.be(1);
        expect(res.body.result[0]).to.be.below(0.2);
        done();
      });
  });

  //  Get JSON of already-trained network
  it('get stored JSON of trained XOR network', function(done){
    superagent.get(baseUrl+"/api/networks/"+networkName)
      .end(function(e,res){
        //console.log(res.body);
        expect(e).to.eql(null);
        expect(typeof res.body.result).to.eql("object");
        expect ("layers" in res.body.result).to.eql(true);
        savedJson = res.body.result;
        done();
      });
  });


  //  Delete the XOR network
  it('Delete the XOR network', function(done){
    superagent.del(baseUrl+"/api/networks/"+networkName)
      .end(function(e,res){
        expect(e).to.eql(null);
        expect(res.body.status).to.be("ok");
        done();
      });
  });

  //  Confirm that there are no networks defined anymore
  it('get empty list of networks after deleting XOR', function(done){
    superagent.get(baseUrl+'/api/networks')
      .end(function(e,res){
        //console.log(res.body);
        expect(e).to.eql(null);
        expect(typeof res.body.result).to.eql("object");
        expect(res.body.result).not.to.contain(networkName);
        done();
      });
  });

  // Create network again from savedJson
  it('Create network from saved JSON', function(done){
    superagent.post(baseUrl+"/api/networks/"+networkName)
      .send(savedJson)
      .end(function(e,res){
        //console.log(res.body);
        expect(e).to.eql(null);
        expect(res.body.status).to.eql("ok");
        done();
      });
  });

  // One more test, now with [1, 1].  Use a very forgiving threshold since we're not testing brain.js here but rather the API.
  it('Run XOR network on [1, 1]', function(done){
    superagent.post(baseUrl+"/api/networks/"+networkName+"/run")
      .send({data:[1,1]})
      .end(function(e,res){
        expect(e).to.eql(null);
        expect(typeof res.body.result).to.eql("object");
        expect(res.body.result.length).to.be(1);
        expect(res.body.result[0]).to.be.below(0.2);
        done();
      });
  });

  //  Delete the XOR network
  it('Delete the XOR network', function(done){
    superagent.del(baseUrl+"/api/networks/"+networkName)
      .end(function(e,res){
        expect(e).to.eql(null);
        expect(typeof res.body).to.eql("object");
        expect(res.body.status).to.be("ok");
        done();
      });
  });
});

