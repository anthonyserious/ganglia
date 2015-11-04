#!/bin/bash

#
#  In this example, we create the network, then call /api/networiks/cross/train with training data, as opposed
#  to first adding training data (/api/network/cross/trainingdata), then trainng the network.
#

echo "Creating cross network"
curl -XPOST -H "Content-Type: application/json" -d '{"options":{"layers":[25]}}' http://localhost:8182/api/network/cross
echo
echo "Creating/training cross network"
curl -XPOST -H "Content-Type: application/json" -d @`dirname $0`/cross.json http://localhost:8182/api/network/cross/train
echo
echo "Running with a cross"
curl -XPOST -H "Content-Type: application/json" -d '{"data":[
  0,0,0,0,0, 
  0,0,0,1,0, 
  1,1,1,1,1, 
  0,0,0,1,0, 
  0,0,0,1,0]}' http://localhost:8182/api/network/cross/run
echo
echo "Running with a cross"
curl -XPOST -H "Content-Type: application/json" -d '{"data":[
  0,0,0,1,0, 
  0,0,1,1,1, 
  0,0,0,1,0, 
  1,1,0,1,0, 
  0,0,0,0,0]}' http://localhost:8182/api/network/cross/run
echo
echo "Running with a cross"
curl -XPOST -H "Content-Type: application/json" -d '{"data":[
  0,0,0,1,0, 
  0,0,1,1,1, 
  0,0,0,1,0, 
  0,0,0,1,0, 
  0,0,0,0,0]}' http://localhost:8182/api/network/cross/run
echo
echo "Running with a cross"
curl -XPOST -H "Content-Type: application/json" -d '{"data":[
  0,0,0,0,0, 
  0,1,0,0,0, 
  0,1,0,0,0, 
  1,1,1,0,0, 
  0,1,0,0,0]}' http://localhost:8182/api/network/cross/run
echo
echo "Running with a non-cross"
curl -XPOST -H "Content-Type: application/json" -d '{"data":[
  0,1,1,0,0, 
  0,0,0,1,0, 
  0,0,0,1,0, 
  1,0,0,1,1, 
  0,0,0,0,0]}' http://localhost:8182/api/network/cross/run
echo
echo "Running with a non-cross"
curl -XPOST -H "Content-Type: application/json" -d '{"data":[
  0,1,0,0,0, 
  0,1,0,0,0, 
  0,1,0,0,0, 
  0,1,1,1,0, 
  0,1,0,0,0]}' http://localhost:8182/api/network/cross/run
echo
echo "Running with a non-cross"
curl -XPOST -H "Content-Type: application/json" -d '{"data":[
  0,0,0,0,0, 
  1,0,1,0,0, 
  1,0,1,1,1, 
  1,0,1,0,0, 
  0,0,0,0,0]}' http://localhost:8182/api/network/cross/run
echo

