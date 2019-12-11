## Configuring Quasar

Environment variables can be passed to Quasar via a `.env` file in the directory root. More info in `[constants.js](https://github.com/openworklabs/quasar/blob/primary/server/constants.js)`.
[](https://github.com/openworklabs/quasar/tree/move/ethereum-constants#demo-env-file-in-root-folder)
**Ethereum network**
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

**Remote IPFS node**
Quasar uses the `js-ipfs-http-client` to connect to a remote IPFS node. Technically, any storage layer that implements the js-ipfs [interface](https://github.com/ipfs/interface-js-ipfs-core) is compatible. Use [these 4 environment variables](https://github.com/openworklabs/quasar/blob/primary/server/constants.js#L6-L9) to configure Quasar’s node.

**Polling intervals**
Quasar polls the Ethereum blockchain to listen for events and the database to remove optimistically pinned data that has not been confirmed by a `PinHash` event within a given time frame.

`DB_POLL_INTERVAL` (ms) - How often Quasar checks the DB to find and remove unconfirmed pins that are past their TTL. Set to 1 week by default. Should be set to a much smaller number (like `50` ms) when running tests.
`TTL` (days) - Number of days for optmistically pinned data to remain available before being removed. Set to 14 days by default.

`CONTRACT_POLL_INTERVAL` (ms) - How often Quasar polls contracts on Ethereum. Set to 30 minutes by default. Should be set to a much smaller number (like `50` ms) when running tests.
`BLOCK_PADDING` (Buffer of eth blocks ignored from HEAD) is set to 15 by default.

## Local development

To develop on Quasar locally, there are 3 steps to run:


1. `npm run prepare:local:dev` - starts a local IPFS node, launches a local ganache-cli blockchain network, compiles and migrates a storage registry contract, and registers 1 storage contract.
2. take the `Registry` contract address and set it in your `.env` file as `STORAGE_REGISTRY_CONTRACT_ADDRESS`
3. `npm run start:dev` - starts the Quasar dev server, listening on port 3001.
## Other scripts

`npm run test` runs the jest testing suite.

`npm run emit:registerEvent` - fires a `Register` event on the storage registry contract registered with Quasar.
`npm run emit:pinHashEvent` fires a `PinHash` event on the storage contract registered with Quasar.

Note - both these scripts work on rinkeby and local chains. Extra steps are required for this to work on `rinkeby`.


1. Set `BLOCKCHAIN_NETWORK=rinkeby` in your `.env` file.
2. Set `MNEMONIC` in your `.env` file. Make sure the first account (zero indexed - `accounts[0]`) is unlocked and has rinkeby Eth available to use.
3. Set a `BLOCKCHAIN_PROVIDER_HTTP_URL` in your `.env` file. See [here](https://paper.dropbox.com/doc/DAO-data-stores-and-the-roadmap-to-getting-there--Ao~MW7fV8XvHkZL2UgsYkPfqAg-Lnhuiqa2om4pOc1kWNVx0#:h2=Ethereum-network) for more information.
----------