# Quasar start up guide

If you run into any trouble, see the section [troubleshooting]() or file a new issue on our github page.

### Dependencies

- [MonboDB](https://www.mongodb.com/) - for any issues related directly to mongoDB, we'd recommend checking their documentation first.
- [Node.js](https://nodejs.org/en/) - we've been using node `v12.9.0` with no problems.

### Configuring a .env file

There are a few required `.env` variables. An example can be found [here]().

### Run Quasar Locally

1. `npm i`
1. `npm run prepare:local:dev` - starts a local IPFS node, launches a local ganache-cli blockchain network, compiles and migrates a storage registry contract, and registers 1 storage contract for Quasar to listen to.
2. take the `Registry` contract address and set it in your `.env` file as `STORAGE_REGISTRY_CONTRACT_ADDRESS`
3. `npm run start:dev` - starts the Quasar dev server, listening on port 3001.

### Other scripts

`npm run test` runs the jest testing suite.

`npm run emit:registerEvent` - fires a `Register` event on the storage registry contract registered with Quasar.
`npm run emit:pinHashEvent` fires a `PinHash` event on the storage contract registered with Quasar.

Note - both these scripts work on rinkeby and local chains. Extra steps are required for this to work on `rinkeby`.

## Customizing Quasar's configuration

Full [example]()

### Ethereum networks

Quasar connects to an Ethereum node using the web3 HTTP provider:

`BLOCKCHAIN_NETWORK` is one of either `local`, `mainnet`, or `rinkeby`.
`BLOCKCHAIN_PROVIDER_HTTP_URL` is an ethereum node http url. Common variables:

*ganache*

    BLOCKCHAIN_NETWORK="local"
    BLOCKCHAIN_PROVIDER_HTTP_URL="http://localhost:8545"

*rinkeby*

    BLOCKCHAIN_NETWORK="rinkeby"
    BLOCKCHAIN_PROVIDER_HTTP_URL="https://rinkeby.infura.io/v3/<key>"

*mainnet*

    BLOCKCHAIN_NETWORK="mainnet"
    BLOCKCHAIN_PROVIDER_HTTP_URL="https://mainnet.infura.io/v3/<key>"

### Remote IPFS node

Quasar uses the `js-ipfs-http-client` to connect to a remote IPFS node. Technically, any storage layer that implements the js-ipfs [interface](https://github.com/ipfs/interface-js-ipfs-core) is compatible.

`IPFS_NODE_HOST=localhost`
`IPFS_NODE_PROTOCOL=http`
`IPFS_AUTH=Basic [auth_key_here]`
`IPFS_NODE_PORT=5001`
`IPFS_API_PATH=/ipfs/api/v0/`

### Database polling intervals

Quasar polls the database to remove optimistically pinned data that has not been confirmed by a `PinHash` event within a given time frame.

`DB_POLL_INTERVAL` (ms) - How often Quasar checks the DB to find and remove unconfirmed pins that are past their TTL. Set to 1 week by default. Should be set to a much smaller number (like `50` ms) when running tests.
`TTL` (days) - Number of days for optmistically pinned data to remain available before being removed. Set to 14 days by default.

### Ethereum polling intervals

Quasar polls the Ethereum blockchain to listen for events and the database to remove optimistically pinned data that has not been confirmed by a `PinHash` event within a given time frame.

`DB_POLL_INTERVAL` (ms) - How often Quasar checks the DB to find and remove unconfirmed pins that are past their TTL. Set to 1 week by default. Should be set to a much smaller number (like `50` ms) when running tests.
`TTL` (days) - Number of days for optmistically pinned data to remain available before being removed. Set to 14 days by default.

`CONTRACT_POLL_INTERVAL` (ms) - How often Quasar polls contracts on Ethereum. Set to 30 minutes by default. Should be set to a much smaller number (like `50` ms) when running tests.
`BLOCK_PADDING` (Padding of eth blocks ignored from HEAD) is set to 15 by default.

### Example

```
# IPFS variables are optional - Quasar defaults to local IPFS node values
IPFS_NODE_HOST=localhost
IPFS_NODE_PROTOCOL=http
IPFS_AUTH=Basic [auth_key_here]
IPFS_NODE_PORT=5001
IPFS_API_PATH=/ipfs/api/v0/

# MongoDB auth — REQUIRED
MONGO_INITDB_ROOT_USERNAME=<username>
MONGO_INITDB_ROOT_PASSWORD=<password>

# Polling interval variables — all optional
DB_POLL_INTERVAL=86400000 # 1 day
CONTRACT_POLL_INTERVAL=1800000 # 30 min
TTL=14 # How many days pins will remain before confirmed
BLOCK_PADDING=20 # Buffer of eth blocks ignored from HEAD

# Blockchain variables - REQUIRED when using Docker
BLOCKCHAIN_PROVIDER_HTTP_URL=https://rinkeby.infura.io/v3/<project-id>
BLOCKCHAIN_NETWORK=rinkeby
MNEMONIC=peanut butter tequila shots hotbox nuggets obesity funk chunk snowball bernie twentytwenty
STORAGE_REGISTRY_CONTRACT_ADDRESS=0xD712b21A5E8D9G0FE307E0fef6bC82c700a10D
```

## Rinkeby usage

1. Set `BLOCKCHAIN_NETWORK=rinkeby` in your `.env` file.
2. Set `MNEMONIC` in your `.env` file. Make sure the first account (zero indexed - `accounts[0]`) is unlocked and has rinkeby Eth available to use.
3. Set a `BLOCKCHAIN_PROVIDER_HTTP_URL` in your `.env` file.

## Deployment with Docker

This assumes you have a docker instance with ssh access already running. [Digital Ocean](https://marketplace.digitalocean.com/apps/docker) provides a one-click Ubuntu-docker setup, and there are plenty of [tutorials](https://www.linux.com/tutorials/how-install-and-use-docker-linux/) to get you started if you want to _really_ self-host.

1. Run `git clone http://github.com/openworklabs/quasar`.
2. Add `.env` file in project root and enter required variables (see below).
3. Make sure docker is running `systemctl start docker`.
4. Run `docker-compose up -d` (with external ipfs node) or `docker-compose -f docker-compose.ipfs.yml up -d` (with local ipfs node).

Blockchain variables - REQUIRED when using Docker

`BLOCKCHAIN_PROVIDER_HTTP_URL=https://rinkeby.infura.io/v3/<project-id>`<br />
`BLOCKCHAIN_NETWORK=rinkeby`<br />
`MNEMONIC=peanut butter tequila shots hotbox nuggets obesity funk chunk snowball bernie twentytwenty`<br />
`STORAGE_REGISTRY_CONTRACT_ADDRESS=0xD712b21A5E8D9G0FE307E0fef6bC82c700a10D`<br />
