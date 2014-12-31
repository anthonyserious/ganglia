#!/bin/bash

echo "Creating/training XOR network"
curl -XPOST -H "Content-Type: application/json" -d '{"data":[{"input": [0, 0], "output": [0]}, {"input": [0, 1], "output": [1]}, {"input": [1, 0], "output": [1]}, {"input": [1, 1], "output": [0]}]}' http://localhost:8181/api/train/xor
echo
echo "Running with [0,1]"
curl -XPOST -H "Content-Type: application/json" -d '{"data":[0,1]}' http://localhost:8181/api/run/xor
echo

