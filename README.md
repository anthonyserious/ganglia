# Parietal - a RESTful neural network server
Parietal is a Node.js app which exposes a RESTful API for functions from the nifty [brain.js][brain] module.  Parietal allows you to host multiple different neural networks, with persistence in MongoDB.  File-based persistence will be added "soon".

# Running
To run Parietal, do `git clone https://github.com/anthonyserious/parietal.git` and `cd parietal`.  Adjust variables as necessary in `config.yml`, then run `node ./index.js`.

# Testing
To test, run `npm test`.

# Methods
Parietal provides the following CRUD operations:

### /api/networks
* GET `/api/networks` - list networks in memory.
* GET `/api/networks/ID` - dumps JSON representation of a (presumably trained) network.
* DELETE `/api/networks/ID` - deletes the network named "ID".
* POST `/api/networks/ID` - creates a network named "ID", by either supplying JSON of a previously trained network or supplying JSON with options for creating a new network.

### /api/networks/ID/trainingdata
* GET `/api/networks/ID/trainingdata` - returns the persisted training data for the network named "ID".
* POST `/api/networks/ID/trainingdata` - insert training data for the network named "ID".  Training data should be of the form `{ "data":[ { "input": [...], "output": [...]}, ...]}`
* DELETE `/api/networks/ID/trainingdata` - delete the persisted training data for the network named "ID".

### /api/networks/ID/train
* POST `/api/networks/ID/train` - train the network named "ID" based on stored training data. Expected format is: `{ "params":{...}}` according to the parameters format described in the [brain.js][brain] documentation.

### /api/networks/ID/run
* POST `/api/networks/ID/run` - run the network "ID" with the supplied JSON.  Expected format is `{ "data":...}`.  The format is aligned with the objects described in the [brain.js][brain] documentation.

# Examples
### XOR
Using the XOR example (./examples/xor.sh) described in the [brain.js][brain] repository:
```bash
$ curl -XPOST -H "Content-Type: application/json" -d '{"data":[{"input": [0, 0], "output": [0]}, {"input": [0, 1], "output": [1]}, {"input": [1, 0], "output": [1]}, {"input": [1, 1], "output": [0]}]}' http://localhost:8181/api/networks/xor/train
Training: 'xor'
[ { input: [ 0, 0 ], output: [ 0 ] },
  { input: [ 0, 1 ], output: [ 1 ] },
  { input: [ 1, 0 ], output: [ 1 ] },
  { input: [ 1, 1 ], output: [ 0 ] } ]
{"error":0.004998080287413607,"iterations":4776}
$ curl -XPOST -H "Content-Type: application/json" -d '{"data":[0,1]}' http://localhost:8181/api/networks/xor/run
[0.9280835524564033]
$
```

### Recognition of cross patterns
Here we create a network to recognize cross patterns on a 5-by-5 grid.  Network inputs are 5-by-5 grids as row-major, 25 element arrays.  A cross is a pattern where there is a 1 bordered on all sides by 1s.  The following is an example of what the network should recognize as a cross:
```
[0,0,0,0,0,
 0,0,0,1,0,
 0,1,1,1,1,
 0,0,0,1,0,
 0,0,0,0,0]
```
You can run `examples/cross.sh`, which should have similar output:
```bash
$ ./examples/cross.sh 
Creating cross network
{"status":"created"}
Creating/training cross network
{"error":0.0049405190899400805,"iterations":164}
Running with a cross
[0.9504015309710259]
Running with a cross
[0.7345939958206359]
Running with a cross
[0.9041989995022514]
Running with a cross
[0.894384797891054]
Running with a non-cross
[0.05211943280258072]
Running with a non-cross
[0.11822416731377493]
Running with a non-cross
[0.3003437370383277]
$
```

[brain]: https://github.com/harthur/brain
