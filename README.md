# Parietal - a RESTful neural network server
Parietal is a Node.js app which exposes a RESTful API for functions from the nifty [brain.js][brain] module.  Parietal allows you to host multiple different neural networks, with persistence in mongodb.  File-based persistence will be added "soon".

## Running
To run Parietal, do `git clone https://github.com/anthonyserious/parietal.git` and `cd parietal`.  Adjust variables as necessary in `config.yml`, then run `npm start`.  To stop the server run `npm stop`.

## Testing
To test, run `npm test`.  Note that some tests assume an empty MongoDB collection, so if you test with an already populated collection then some tests will fail.

## Methods
Parietal provides basic CRUD operations:
* GET `/api/networks` - list networks in memory.
* GET `/api/networks/ID` - dumps JSON representation of a (presumably trained) network.
* DELETE `/api/networks/ID` - deletes the network named "ID".
* POST `/api/networks/ID` - creates a network named "ID", by either supplying JSON of a previously trained network or supplying JSON with options for creating a new network.  Note that running /api/train/ID will create a new network if it doesn't already exist, using the default `brain.NeuralNetwork() options`.
* POST `/api/networks/ID/train` - train the network "ID" with the supplied JSON.  Expected format is (with "params" optional): `{ "params":{...}, "data":{"input":..., "output":...}}`.  The format is aligned with the objects described in the [brain.js][brain] documentation.
* POST `/api/networks/ID/run` - run the network "ID" with the supplied JSON.  Expected format is `{ "data":...}`.  The format is aligned with the objects described in the [brain.js][brain] documentation.

## Example
Using the XOR example described in the [brain.js][brain] repository:
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
[brain]: https://github.com/harthur/brain
