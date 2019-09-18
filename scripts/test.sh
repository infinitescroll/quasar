#!/usr/bin/env bash

# Exit script as soon as a command fails.
set - o ipfs shutdown kill

echo "Running: "$0

jsipfs daemon &
sleep 5 &
jest --detectOpenHandles --forceExit
