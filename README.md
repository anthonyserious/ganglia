# Parietal - a RESTful Node.js app wrapping brain.js functions
Parietal is a Node.js app which exposes a RESTful API for functions from the very cool [brain.js][brain] module.  Parietal allows you to host multiple different neural networks in memory.  Some persistance operations will hopefully be added soon.

## Running
To run Parietal, do `git clone https://github.com/anthonyserious/parietal.git` and `cd parietal`.  Adjust `port` and `logpath` as necessary in `config.yml`, then run `./index.js`.

## Methods
Parietal provides basic CRUD operations:
* GET `/api/networks` - list networks in memory.
* GET `/api/networks/ID` - dumps JSON representation of a (presumably trained) network.
* DELETE `/api/networks/ID` - deletes the network named "ID".
* POST `/api/networks/ID` - creates a network named "ID", by either supplying JSON of a previously trained network or supplying JSON with options for creating a new network.  Note that running /api/train/ID will create a new network if it doesn't already exist, using the default `brain.NeuralNetwork() options`.
* POST `/api/train/ID` - train the network "ID" with the supplied JSON.  Expected format is (with "params" optional): `{ "params":{...}, "data":{"input":..., "output":...}}`.  The format is aligned with the objects described in the [brain.js][brain] documentation.
* POST `/api/run/ID` - run the network "ID" with the supplied JSON.  Expected format is `{ "data":...}`.  The format is aligned with the objects described in the [brain.js][brain] documentation.

## Example
Using the XOR example described in the [brain.js][brain] repository:
```bash
$ curl -XPOST -H "Content-Type: application/json" -d '{"data":[{"input": [0, 0], "output": [0]}, {"input": [0, 1], "output": [1]}, {"input": [1, 0], "output": [1]}, {"input": [1, 1], "output": [0]}]}' http://localhost:8181/api/train/xor
Training: 'xor'
[ { input: [ 0, 0 ], output: [ 0 ] },
  { input: [ 0, 1 ], output: [ 1 ] },
  { input: [ 1, 0 ], output: [ 1 ] },
  { input: [ 1, 1 ], output: [ 0 ] } ]
{"error":0.004998080287413607,"iterations":4776}
$ curl -XPOST -H "Content-Type: application/json" -d '{"data":[0,1]}' http://localhost:8181/api/run/xor
[0.9280835524564033]
$
```
[brain]: https://github.com/harthur/brain

