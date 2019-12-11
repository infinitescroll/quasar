# Under the hood

At the highest level, Quasar is composed of 4 parts:

1. **Storage layer** - an IPFS node or cluster (or any alternative that implements the js-ipfs [interface](https://github.com/ipfs/interface-js-ipfs-core)).
2. **Storage wrapper** - A wrapper around the storage layer that manages what data gets stored. The wrapper runs a number of microservices (explained [here]() that could eventually be abstracted into their own modules.
3. **Storage contract(s**) - One or more contracts that use `PinHash` smart contract event logs to tell the storage wrapper what data to pin to the storage layer.
4. **Storage registry contract** - a single contract that stores pointers to each of the storage contracts.
![](https://paper-attachments.dropbox.com/s_E5062EC0ED2F89286569337DBE9E4F39ED10C38B3CAEFF747B255F9A4D2850D0_1574302599340_image.png)

Quasar's primary objective is to listen for IPFS `cid`s that are emitted through [`PinHash` ethereum events]((https://github.com/openworklabs/quasar/blob/primary/contracts/DataStore.sol)). When Quasar hears of a new `cid` from one of it's storage contracts through an event, it confirms that `cid` as valid in the storage layer and persists it.

## Optimistic Pinning

Ethereum events can take a long time to confirm in a clogged network. In this case, there might be a gap in time after *submitting* a transaction and before Quasar *hear*s the event when data is not yet available in the DAO data store. This poses an obvious problem.

![](https://paper-attachments.dropbox.com/s_E5062EC0ED2F89286569337DBE9E4F39ED10C38B3CAEFF747B255F9A4D2850D0_1574302895947_image.png)

To get around this problem, we use a system called “optimistic pinning” - where a `cid` is pinned to the DAO data store for a predefined period of time via HTTP endpoints, and then either “removed” or “confirmed” based on the existence of a `PinHash` event with that `cid` at a later point in time. When data is optimistically pinned, it remains available for people to fetch before any ethereum transactions containing `PinHash` events get fired. No more time gap to worry about.

## Microservices in Quasar

[**API Server**](https://github.com/openworklabs/quasar/blob/primary/server/routes/index.js)
Exposes endpoints to optimistically pin data, fetch information about the storage layer, and get/set information about storage contracts.

[**MongoDB**](https://github.com/openworklabs/quasar/tree/primary/server/db)
Stores metadata about storage contracts, storage registry contracts, and pinned data.

[**StorageRegistryWatcher** (command + f "registerStorageRegistryWatcher")](https://github.com/openworklabs/quasar/blob/primary/server/index.js#L67)
Polls storage registry contract for new events.

[**StorageContractWatcher** (command + f "registerPinWatcher")](https://github.com/openworklabs/quasar/blob/primary/server/ethereum/index.js)
Polls storage contracts for new events.

[**PinChecker** (command + f "registerPinWatcher")](https://github.com/openworklabs/quasar/blob/primary/server/ethereum/index.js)
Polls the database, checks pinned data, removes and unpins data that have not been confirmed in their given time to live window.

These services could be abstracted and run in their own processes to improve scalability in the future.

## Flow

To ask Quasar to listen for `PinHash` events from a *new* storage contract, emit a [`Register` event on the Storage registry contract](https://github.com/openworklabs/quasar/blob/primary/contracts/StorageRegistry.sol). To tell Quasar to stop listening to a particular storage contract, emit an `Unregister` event.

1. Ask Quasar to optimistically pin some data by sending an HTTP request to `/api/v0/dag/put` or `/api/v0/files/add` with the data you want pinned in the request body ([example](https://github.com/openworklabs/aragon/blob/feat/client-storage/src/storage/Quasar.js)). Then, Quasar will:
    1. pin the DAG or file to the storage layer.
    2. store a reference to the pinned data’s `cid`, and the time the request was made in a database (`[PinList](https://github.com/openworklabs/quasar/blob/primary/server/db/pinSchema.js)`).
    3. return the `cid` to the client.
2. Emit a `PinHash` event on contract `0x123` passing the `cid` from step 1.
3. When Quasar hears the `PinHash` event it will:
    1. decode the event log.
    2. get the `cid` parameter.
    3. mark the associated database entry from the `PinList` as “confirmed”.
4. Any documents in the `PinList` that have been in the database for longer than the TTL environment variable (default is 14 days) from the storage layer and removed from the `PinList`.
![](https://paper-attachments.dropbox.com/s_E5062EC0ED2F89286569337DBE9E4F39ED10C38B3CAEFF747B255F9A4D2850D0_1574357434057_image.png)

## Registering new storage contracts to listen to

Quasar is associated with a single [storage registry contract](https://github.com/openworklabs/quasar/blob/primary/contracts/StorageRegistry.sol) that holds references to all the storage contracts to listen to. Using API keys to register storage contracts would not _truly_ be trustless (also, why wouldn't you just use those API keys to manage the pinning permission on your node?). Using a smart contract allows us to inherit more flexible authentication schemes.

Any time you want to register a new storage contract with Quasar, simply fire the `Register` event from the storage registry contract. Note - registering storage contracts that do not implement the [storage contract interface](https://github.com/openworklabs/quasar/blob/primary/contracts/DataStore.sol) will not work. To tell Quasar to stop listening to any contract, emit an `Unregister` event with the contract’s address to unregister.

More information about this in the [configuration doc](https://github.com/openworklabs/quasar/blob/update/docs/docs/usingQuasar.md#customizing-quasars-configuration)

Quasar is associated with a single storage registry contract that holds references to all the storage contracts to listen to. After deploying a [storage registry contract](https://github.com/openworklabs/quasar/blob/primary/contracts/StorageRegistry.sol) to Ethereum, copy the contract’s address, and pass it to Quasar via the `STORAGE_REGISTRY_CONTRACT_ADDRESS` (see [constants.js](https://github.com/openworklabs/quasar/blob/primary/server/constants.js) [file](https://github.com/openworklabs/quasar/blob/primary/server/constants.js) for full list of environment variables).

Any time you want to register a new storage contract with Quasar, simply fire the `Register` event from the storage registry contract. Note - registering storage contracts that do not implement the [storage contract interface](https://github.com/openworklabs/quasar/blob/primary/contracts/DataStore.sol) will not work. To tell Quasar to stop listening to any contract, emit an `Unregister` event with the contract’s address to unregister.

Quasar can expose an optional `POST` endpoint `/api/v0/storageContracts` to register a new storage smart contract. We [use this in the Aragon Client](https://github.com/openworklabs/aragon/blob/feat/client-storage/src/storage/Quasar.js) to register a new storage contract with Quasar when the new DAO is loaded.

