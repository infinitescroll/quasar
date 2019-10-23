[![codecov](https://codecov.io/gh/openworklabs/quasar/branch/primary/graph/badge.svg)](https://codecov.io/gh/openworklabs/quasar)

[![Build Status](https://travis-ci.org/openworklabs/quasar.svg?branch=primary)](https://travis-ci.org/openworklabs/quasar)

## What is Quasar?

Quasar is smart contract based IPFS storage built for the Aragon Network but it’s applicable to other Ethereum apps—it lets users save data based on permissions set in custom contracts.

Once your contract has been registered with Quasar, data can be saved to IPFS using a `PinHash` event in the contract. When Quasar hears a `PinHash` event, it will attempt to pin the hash that was passed in the function.

### Motivation

[Smart Contract Based IPFS Storage for DAOs](https://medium.com/open-work-labs/smart-contract-based-ipfs-storage-for-daos-39c145f3042d)

[Aragon Grant Proposal](https://github.com/aragon/flock/blob/master/teams/Autark/2019_ANV-3.md#08---facilitating-smart-contract-based-ipfs-pinning)

## Flow

1. Register contract with Quasar.
2. Emit `PinHash` event from contract with IPFS hash passed as a parameter. User must make data associated with the hash available on the network for Quasar to retrieve.
3. Quasar hears `PinHash` event.
4. Quasar queries IPFS for data associated with the hash.
5. Quasar pins data on IPFS.

## Deployment [with docker + nodejs >= 12]

1. run `git clone http://github.com/openworklabs/quasar`
2. Add `.env` file in project root and make sure you include: `DB_POLL_INTERVAL` (number of ms), `CONTRACT_POLL_INTERVAL` (number of ms), `BLOCKCHAIN_NETWORK` (rinkeby, mainnet, etc), `BLOCKCHAIN_PROVIDER_HTTP_URL`, `MNEMONIC` (you're seed phrase). If you are using an external ipfs provider, include `IPFS_NODE_HOST`, `IPFS_NODE_PROTOCOL`, `IPFS_AUTH`, `IPFS_NODE_PORT`, and `IPFS_API_PATH`.
3. run `docker-compose up --build -d` (with external ipfs node) or `docker-compose -f docker-compose.ipfs.yml up --build -d` (runs and uses local ipfs node)

#### demo .env file

```
IPFS_NODE_HOST=ipfs.autark.xyz
IPFS_NODE_PROTOCOL=https
IPFS_AUTH=Basic [auth_key_here]
IPFS_NODE_PORT=5001
IPFS_API_PATH=/ipfs/api/v0/
DB_POLL_INTERVAL=100
CONTRACT_POLL_INTERVAL=100
BLOCKCHAIN_PROVIDER_HTTP_URL=https://rinkeby.infura.io/v3/9c2e43c9asdfadfad34ysdafcc3d52
MNEMONIC=peanut butter tequila shots hotbox nuggets obesity funk chunk snowball bernie twentytwenty
BLOCKCHAIN_NETWORK=rinkeby
LISTENER_CONTRACT_ADDRESS=0xD712b21A5E8D9G0FE307E0fef6bC82c700a10D
```

## Dev setup

Note: this is a WIP. We'll eventually have step by step instructions on self-hosting here.
[ requires node 12 or higher ]

example `.env` file (in root folder):

```
# all of these are optional - quasar defaults to local ipfs node if not set
# variables for setting up ipfs connection
IPFS_NODE_HOST=ipfs.autark.xyz
IPFS_NODE_PROTOCOL=https
IPFS_AUTH=your_auth_here
IPFS_NODE_PORT=5001
IPFS_API_PATH=/ipfs/api/v0/

# intervals for polling contracts (in ms)
# change to something way higher for production
DB_POLL_INTERVAL=100
CONTRACT_POLL_INTERVAL=100
```

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
