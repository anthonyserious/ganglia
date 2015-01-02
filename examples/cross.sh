#!/bin/bash

echo "Creating cross network"
curl -XPOST -H "Content-Type: application/json" -d '{"options":{"layers":[25]}}' http://localhost:8182/api/networks/cross
echo
echo "Creating/training cross network"
curl -XPOST -H "Content-Type: application/json" -d @`dirname $0`/cross.json http://localhost:8182/api/networks/cross/train
echo
echo "Running with a cross"
curl -XPOST -H "Content-Type: application/json" -d '{"data":[
  0,0,0,0,0, 
  0,0,0,1,0, 
  1,1,1,1,1, 
  0,0,0,1,0, 
  0,0,0,1,0]}' http://localhost:8182/api/networks/cross/run
echo
echo "Running with a cross"
curl -XPOST -H "Content-Type: application/json" -d '{"data":[
  0,0,0,1,0, 
  0,0,1,1,1, 
  0,0,0,1,0, 
  1,1,0,1,0, 
  0,0,0,0,0]}' http://localhost:8182/api/networks/cross/run
echo
echo "Running with a cross"
curl -XPOST -H "Content-Type: application/json" -d '{"data":[
  0,0,0,1,0, 
  0,0,1,1,1, 
  0,0,0,1,0, 
  0,0,0,1,0, 
  0,0,0,0,0]}' http://localhost:8182/api/networks/cross/run
echo
echo "Running with a cross"
curl -XPOST -H "Content-Type: application/json" -d '{"data":[
  0,0,0,0,0, 
  0,1,0,0,0, 
  0,1,0,0,0, 
  1,1,1,0,0, 
  0,1,0,0,0]}' http://localhost:8182/api/networks/cross/run
echo
echo "Running with a non-cross"
curl -XPOST -H "Content-Type: application/json" -d '{"data":[
  0,1,1,0,0, 
  0,0,0,1,0, 
  0,0,0,1,0, 
  1,0,0,1,1, 
  0,0,0,0,0]}' http://localhost:8182/api/networks/cross/run
echo
echo "Running with a non-cross"
curl -XPOST -H "Content-Type: application/json" -d '{"data":[
  0,1,0,0,0, 
  0,1,0,0,0, 
  0,1,0,0,0, 
  0,1,1,1,0, 
  0,1,0,0,0]}' http://localhost:8182/api/networks/cross/run
echo
echo "Running with a non-cross"
curl -XPOST -H "Content-Type: application/json" -d '{"data":[
  0,0,0,0,0, 
  1,0,1,0,0, 
  1,0,1,1,1, 
  1,0,1,0,0, 
  0,0,0,0,0]}' http://localhost:8182/api/networks/cross/run
echo

