# Usages in aragon

We implemented support for Quasar in both aragon.js and the Aragon client, so the A1 team can evaluate handling "DAO datastore" support in multiple places by seeing it in action (we call an IPFS node wrapped in Quasar a "DAO datastore" in the context of Aragon).

We think it makes more sense to handle support for Quasar in the wrapper > client because there's no benefit to performing IPFS operations directly inside react components (rather than in a background script). Achieving Quasar support is also way simpler through aragon.js.

All experimental Quasar features can be found in `experimental-oe` branches of aragon client and aragon.js.

## aragon.js

Adding support for interacting with the DAO's data store in aragon.js gives aragon apps a way to store user generated content without hosting their own storage infrastructure. We implemented the following changes to give support to the Open Enterprise Projects App through aragon.js:

- Emitting `PinHash` events in the [Projects' app contract](https://github.com/AutarkLabs/open-enterprise/blob/experimental-oe/apps/projects/contracts/Projects.sol) whenever data should get pinned. (command + f "PinHash")
- Marking the projects app as "storage" in its [`arap.json`](https://github.com/AutarkLabs/open-enterprise/blob/experimental-oe/apps/projects/arapp.json)
- Iterating through the DAO' apps, and [registering each app marked as "storage" (in its `arap.json`) with Quasar](https://github.com/openworklabs/aragon.js/blob/experimental-oe/packages/aragon-wrapper/src/utils/quasar.js). See section on [registering new storage contracts to listen to](https://github.com/openworklabs/quasar/blob/primary/docs/howQuasarWorks.md#registering-new-storage-contracts-to-listen-to) for more information.
- aragon-api support for data store methods through the [datastore handler](https://github.com/openworklabs/aragon.js/blob/experimental-oe/packages/aragon-api/src/index.js) (command + f "datastore")
- aragon-wrapper support through the [datastore class](https://github.com/openworklabs/aragon.js/blob/experimental-oe/packages/aragon-wrapper/src/datastore/index.js)

Note - we use FormData in the wrapper, which might break things when this package is required in a node environment (you would need to polyfill the FormData to use somethin that works in node). The security restrictions forbit us from passing FormData through the api calls, so we need to handle it on the wrapper side.

## aragon/client

Our first take at building support for Quasar was done completely in the client. The goal was to support pinning a blob of data that represents the organization's settings.

- When the DAO loads, [determine if there's a storage app installed]() via the kernal (note - we could loop through the organization apps' arap.json files to determine if any of them are marked as `storage` like we implemented in aragon.js. This would allow a DAO to pin data without having a dedicated storage smart contract installed).
- Expose functions via an DAO datastore hook that provides information about the IPFS connection, the storage app, and methods to get and set data.

Exposing hooks in this way provides an alternative support mechanism for datastore interaction via aragon.js. If requests to interact with the datastore were pushed to an Observable (in a similar way as signing messages or transactions), the client could subscribe to the "datastore" observable (hypothetically). When an aragon app wishes to make a call to the datastore, it `next`s the request to the associated observable. The client hears the update to the observable, and can easily handle it with the associated methods exposed from the `useOrganizationDataStore` hook. More information about this is in the code video walkthrough.

## Future revenue model

New Aragon DAOs shouldn’t have to worry about hosting their own DAO datastore. To get started, organizations by default will connect with Aragon Association’s data store and be given a free amount of storage space. When the organization runs out of space, admins can either self host their own DAO data store or pay the Aragon Association to provide more space. This could serve as an early revenue model for the Association, especially if Aragon Apps get in the habit of using the datastore methods to store user generated content.
