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
  ganache-cli -b 3
}

function compile_and_migrate_contracts {
  truffle compile &
  compile_pid=$!
  wait $compile_pid
  truffle migrate &
  migrate_pid=$!
  wait migrate_pid
}

function chain_ready {
  start_chain &
  sleep 5 &
  compile_and_migrate_contracts
}

function start {
  listener_ready &
  server_pid=$!
  wait server_pid
  echo "SERVER AND IPFS DAEMON ARE UP AND RUNNING"
  chain_ready &
  chain_pid=$!
  wait chain_pid
  echo "LOCAL CHAIN RUNNING, CONTRACTS COMPILED AND MIGRATED"
}

start




