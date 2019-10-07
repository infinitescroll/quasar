[![codecov](https://codecov.io/gh/openworklabs/quasar/branch/primary/graph/badge.svg)](https://codecov.io/gh/openworklabs/quasar)

[![Build Status](https://travis-ci.org/openworklabs/quasar.svg?branch=primary)](https://travis-ci.org/openworklabs/quasar)

## What is Quasar?

Quasar is smart contract based IPFS storage built for the Aragon Network but it’s applicable to other Ethereum apps—it lets users save data based on permissions set in custom contracts. 

Once your contract has been registered with Quasar, data can be saved to IPFS using a `PinHash`  event in the contract. When Quasar hears a `PinHash` event, it will attempt to pin the hash that was passed in the function. 

### Motivation
[Smart Contract Based IPFS Storage for DAOs](https://medium.com/open-work-labs/smart-contract-based-ipfs-storage-for-daos-39c145f3042d)

[Aragon Grant Proposal](https://github.com/aragon/flock/blob/master/teams/Autark/2019_ANV-3.md#08---facilitating-smart-contract-based-ipfs-pinning)

## Flow
1. Register contract with Quasar.
2. Emit `PinHash` event from contract with IPFS hash passed as a parameter. User must make data associated with the hash available on the network for Quasar to retrieve. 
3. Quasar hears `PinHash` event.
4. Quasar queries IPFS for data associated with the hash.
5. Quasar pins data on IPFS.

## Local dev setup
`npm run prepare:local:dev` boots up test chain, compiles & migrates contracts, and starts an IPFS daemon locally with js-ipfs.
<br />

`npm run start:dev` starts the node server.

## Architecture

The two central pieces to this system are the smart contracts and the event listening server.

### Contracts

In this repo you’ll see that there are two contracts—one that defines which smart contracts are being listened to, and one that emits `PinHash` events. 

### Event Listening Server

This event listening server is a Node app that connects to the Ethereum blockchain as well an IPFS node provider. Right now Ganache and Rinkeby chains are supported and any IPFS node can be used by setting the `IPFS_NODE_HOST`, `IPFS_NODE_PORT`, and `IPFS_NODE_PROTOCOL` environment variables in a .env file in the server directory. 

In general, here’s what’s happening—the server is constantly listening to events on the Ethereum blockchain. Upon hearing `PinHash` events, it decodes the events logs, and attempts to pin that data. 

![](https://miro.medium.com/max/2880/1*nxldVNAwwSPRUBqPyEyE7A.png)
