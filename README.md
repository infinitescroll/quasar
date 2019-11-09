[![codecov](https://codecov.io/gh/openworklabs/quasar/branch/primary/graph/badge.svg)](https://codecov.io/gh/openworklabs/quasar)

[![Build Status](https://travis-ci.org/openworklabs/quasar.svg?branch=primary)](https://travis-ci.org/openworklabs/quasar)

## What is Quasar?

Quasar is smart contract based IPFS storage built for the Aragon Network but it’s applicable to other Ethereum apps—it lets users save data based on permissions set in custom contracts.

Once your contract has been registered with Quasar, data can be saved to IPFS using a `PinHash` event in the contract. When Quasar hears a `PinHash` event, it will attempt to pin the hash that was passed in the function.

### Motivation

[Smart Contract Based IPFS Storage for DAOs](https://medium.com/open-work-labs/smart-contract-based-ipfs-storage-for-daos-39c145f3042d)

[Aragon Grant Proposal](https://github.com/aragon/flock/blob/master/teams/Autark/2019_ANV-3.md#08---facilitating-smart-contract-based-ipfs-pinning)

## Flow

1. Register contract with Quasar via `POST` request to `/contracts`
2. Pin dag or file via `POST` request to `/dag/put` or `/files/add` respectively
3. Quasar returns IPFS hash in http response, pins the file/dag, and adds the file/dag to a list to be garbage collected if no `PinHash` event is ever received.
4. Emit `PinHash` event from contract with IPFS hash passed as a parameter.
5. Quasar hears `PinHash` event and removes dag or file from list of unconfirmed pins

## Architecture

The two central pieces to this system are the smart contracts and the event listening server.

### Contracts

In this repo you’ll see that there are two contracts—one that defines which smart contracts are being listened to, and one that emits `PinHash` events.

### Event Listening Server

This event listening server is a Node app that connects to the Ethereum blockchain as well an IPFS node provider. Right now Ganache and Rinkeby chains are supported and any IPFS node can be used by setting the `IPFS_NODE_HOST`, `IPFS_NODE_PORT`, and `IPFS_NODE_PROTOCOL` environment variables in a .env file in the server directory.

The server has endpoints for adding pins: `/dag/put` and `/files/add`. It will temporarily pin dags or files passed to these endpoints for the length of time specified in `.env/DB_POLL_INTERVAL`. It also has an endpoint for adding a storage contract (`/contracts`) like the one in this repo. When this storage contract emits a pin event with a CID, quasar removes the CID from a garbage-collection list, ensuring that the file/dag will be pinned permanently. If a pin event is never emitted, the pin will be removed within `DB_POLL_INTERVAL` ms.

This approach allows DAOs to store their pinning permissions in smart contracts, without worrying about mainnet delays preventing their files from being pinned.

## Example usage:

```javascript
const quasarUrl = 'http://quasar.yourdomain.com' // Wherever you are hosting the server.

// Tell quasar to listen for pin events from a smart contract at contractAddress.
async function addStorageContract(contractAddress) {
  return await fetch(`${quasarUrl}/api/v0/contracts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ contractAddress })
  })
}

// Get a list of storage contracts that quasar is listening to for pin events.
async function getStorageContracts() {
  const response = await fetch(`${quasarUrl}/api/v0/contracts`, {
    method: 'GET'
  })
  return await response.json()
}

// Quasar optimistically pins your dag then returns a hash for you to pass to a storage contract.
// If the storage contract is registered with quasar, the pin is confirmed.
// If the pin is never confirmed, quasar removes it after days defined in TTL envirionment variable.
async function dagPut(dag) {
  const response = await fetch(`${quasarUrl}/api/v0/dag/put`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dag)
  })
  const hash = await response.text()
  storageContract.invokePinMethod(hash)
  return hash
}

// Same as above, but files instead of dags.
async function addFile(file) {
  const response = await fetch(`${quasarUrl}/api/v0/files/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    file
  })
  const hash = await response.text()
  storageContract.invokePinMethod(hash)
  return hash
}
```

## Deployment [with docker]

This assumes you have a docker instance with ssh access already running. [Digital Ocean](https://marketplace.digitalocean.com/apps/docker) provides a one-click Ubuntu-docker setup, and there are plenty of [tutorials](https://www.linux.com/tutorials/how-install-and-use-docker-linux/) to get you started if you want to _really_ self-host.

1. Run `git clone http://github.com/openworklabs/quasar`.
2. Add `.env` file in project root (see example below).
3. Make sure docker is running `systemctl start docker`.
4. Run `docker-compose up -d` (with external ipfs node) or `docker-compose -f docker-compose.ipfs.yml up -d` (with local ipfs node).

#### Demo `.env` file (in root folder):

```
# These ipfs variables are optional - Quasar defaults to local ipfs node values.
IPFS_NODE_HOST=ipfs.autark.xyz
IPFS_NODE_PROTOCOL=https
IPFS_AUTH=Basic [auth_key_here]
IPFS_NODE_PORT=5001
IPFS_API_PATH=/ipfs/api/v0/

# mongodb auth
MONGO_INITDB_ROOT_USERNAME=<username>
MONGO_INITDB_ROOT_PASSWORD=<password>

# polling interval variables (all optional)
DB_POLL_INTERVAL=86400000 # 1 day
CONTRACT_POLL_INTERVAL=1800000 # 30 min
TTL=14 # How many days pins will remain before confirmed
BLOCK_PADDING=20 # Buffer of eth blocks ignored from HEAD

# Blockchain variables - REQUIRED when using Docker
BLOCKCHAIN_PROVIDER_HTTP_URL=https://rinkeby.infura.io/v3/<project-id>
MNEMONIC=peanut butter tequila shots hotbox nuggets obesity funk chunk snowball bernie twentytwenty
BLOCKCHAIN_NETWORK=rinkeby
LISTENER_CONTRACT_ADDRESS=0xD712b21A5E8D9G0FE307E0fef6bC82c700a10D
```

## Dev setup

`npm run prepare:local:dev` boots up test chain, compiles & migrates contracts, and starts an IPFS daemon locally with js-ipfs.
<br />

`npm run start:dev` starts the node server.

## Testing

Set `NODE_ENV` to 'test'.
<br />
`npm run test` and `npm run test:watch` do what you'd expect.
`docker-compose -f docker-compose.test.yml up` runs all tests besides integrations within a docker container (Docker is always deployed to rinkeby or mainnet so it is hard to test chain integrations).
