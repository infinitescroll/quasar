#!/usr/bin/env bash

# Exit script as soon as a command fails.
set - o ipfs shutdown kill

echo "Running: "$0

function start_ipfs_daemon {
  ipfs daemon
}

function start_server {
  nodemon server
}

function listener_ready {
  start_ipfs_daemon &
  sleep 5
  start_server
}

function start_chain {
  node ./scripts/testNet.js
}

function compile_and_migrate_contracts {
  truffle compile
  truffle migrate
}

function chain_ready {
  start_chain &
  sleep 5 &
  compile_and_migrate_contracts
}

function start {
  chain_ready &
  listener_ready
}

start




