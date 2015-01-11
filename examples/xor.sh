#!/bin/bash

#
#  In this example, we add create the network, add trainingdaa, and train it all in one shot.
#

echo "Creating/training XOR network"
curl -XPOST -H "Content-Type: application/json" -d '{"data":[{"input": [0, 0], "output": [0]}, {"input": [0, 1], "output": [1]}, {"input": [1, 0], "output": [1]}, {"input": [1, 1], "output": [0]}]}' http://localhost:8182/api/networks/xor/train
echo
echo "Running with [0,0]"
curl -XPOST -H "Content-Type: application/json" -d '{"data":[0,0]}' http://localhost:8182/api/networks/xor/run
echo
echo "Running with [0,1]"
curl -XPOST -H "Content-Type: application/json" -d '{"data":[0,1]}' http://localhost:8182/api/networks/xor/run
echo
echo "Running with [1,0]"
curl -XPOST -H "Content-Type: application/json" -d '{"data":[1,0]}' http://localhost:8182/api/networks/xor/run
echo
echo "Running with [1,1]"
curl -XPOST -H "Content-Type: application/json" -d '{"data":[1,1]}' http://localhost:8182/api/networks/xor/run
echo

