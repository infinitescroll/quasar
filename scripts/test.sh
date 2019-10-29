#!/usr/bin/env bash

# Exit script as soon as a command fails.
set - o ipfs shutdown kill

echo "Running: "$0

mongod --logpath /dev/null &
node ./scripts/startIpfs &
sleep 5 &
jest --detectOpenHandles --forceExit --silent
