[![codecov](https://codecov.io/gh/openworklabs/quasar/branch/primary/graph/badge.svg)](https://codecov.io/gh/openworklabs/quasar)

[![Build Status](https://travis-ci.org/openworklabs/quasar.svg?branch=primary)](https://travis-ci.org/openworklabs/quasar)

## What is Quasar?

Quasar is smart contract based IPFS storage built for the Aragon Network, but it’s applicable to other Ethereum apps—it lets users save data based on permissions set in custom contracts. 

Once your smart contract has been registered with Quasar, data can be saved to IPFS using a `PinHash`  event in the contract. When Quasar hears a `PinHash` event, it will attempt to pin the hash that was passed in the function. 

## Flow
1. Register contract with Quasar.
2. Emit `PinHash` event from contract with IPFS hash passed as a parameter. User must make data associated with the hash available on the network for Quasar to retrieve. 
3. Quasar hears `PinHash` event.
4. Quasar queries IPFS for data associated with the hash.
5. Quasar pins data on IPFS.

## Local dev setup
`npm run start:dev:local` boots up test chain, compiles & migrates contracts, starts IPFS daemon locally, starts up server.
<br />

`npm run create:pinEvent` submits a transaction to the network so the server can listen for events

## Architecture

The two central pieces to this system are the smart contracts and the event listening server.

### Contracts

In this repo you’ll see that there are two contracts—one that defines which smart contracts are being listened to, and one that emits `PinHash` events. In your implementation, feel free to add more while adhering to the `ListenerInterface`  and `StorageInterface`.


    interface ListenerInterface {

      /// Events
      event Listen(address contractAddress);
      event StopListening(address contractAddress);

      /**
       * @notice Set `address` data to `true`
       * @param contractAddress address of new smart contract to listen to
       */

      function listenToContract(address contractAddress) external;

      function unsubscribeContract(address contractAddress) external;
    }

<br />

    interface StorageInterface {

      /// Events
      event PinHash(string cid);
      event RegisterStorageProvider(string provider, string uri, address providerSetter);

      /**
       * @notice Set `_key` data to `_value`
       * @param _key Data item that will be stored in the registry
       * @param _value Data content to be stored
       */

      function registerData(bytes32 _key, string _value) external;

      function getRegisteredData(bytes32 _key) external view returns(string)

      function registerStorageProvider(string newProvider, string newUri) external;

      function getStorageProvider() external view returns(string, string);
    }


### Event Listening Server

This event listening server is a Node app that connects to the Ethereum blockchain as well an IPFS node provider. Right now Ganache and Rinkeby chains are supported and any IPFS node can be used by setting the `IPFS_NODE_HOST`, `IPFS_NODE_PORT`, and `IPFS_NODE_PROTOCOL` environment variables in a .env file in the server directory. 

In general, here’s what’s happening—the server is constantly listening to events on the Ethereum blockchain. Upon hearing `PinHash` events, it decodes the events logs, and attempts to pin that data. 

![](https://miro.medium.com/max/2880/1*nxldVNAwwSPRUBqPyEyE7A.png)


Here are the main functions of the server:

#### ethereum/index.js
_registerListenWatcher(contract)_—Returns an event emitter that we’ll listen to.<br />
_registerPinWatcher(contract)_—Returns an event emitter that we’ll listen to.<br />
_handleListenEvent(err, event)_—Gets contract address from event and stores that address in memory for easy access.<br />
_handlePinEvent(err, event)_—Gets IPFS hash from the event, queries IPFS for hash, and pings hash.<br />

#### ipfs/index.js
_ipfsWrapper({ port, host, protocol, headers })_—Creates and returns an IPFS http client and a `getAndPin` function.
