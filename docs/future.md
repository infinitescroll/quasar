# The roadmap

These roadmap items are specifically tailored to the Aragon DAO ecosystem. Not everything in this list of roadmap items is planned on being built in AGP73. No particular order among these initiatives has been determined yet.

## aragon.js application support for DAO data store usage

aragon.js should handle application layer support for using the DAO data store. `@aragon/api` could expose simple endpoints to simplify these interactions, like setting and getting data, and registering smart contracts with Quasar. We are starting on an experimental implementation for [Open Enterprises Project’s App](https://github.com/AutarkLabs/open-enterprise/tree/dev/apps/projects) in the coming weeks.

## Bootstrapping storage with Aragon Association node

New Aragon DAOs shouldn’t have to worry about hosting their own DAO data store. To get started, organizations by default will connect with Aragon Association’s data store and be given a free amount of storage space. When the organization runs out of space, admins can either self host their own DAO data store or pay the Aragon Association to provide more space.

A few small tweaks have already been made to support the beginning of this flow:

- Quasar can expose an optional `POST` endpoint `/api/v0/storageContracts` to register a new storage smart contract. We [use this in the Aragon Client](https://github.com/openworklabs/aragon/blob/feat/client-storage/src/storage/Quasar.js#L13) to register a new storage contract with Quasar when the new DAO is loaded.
- Quasar uses an optional `MAX_FILE_SIZE` environment variable to limit the size of each optimistic pin request.
- Quasar stores the size of each piece of data that goes into the storage layer.

What else needs to happen in order for this to work:

- Quasar needs to store the total amount of data pinned by each smart contract.
- Quasar needs to be able to associate multiple smart contracts with one Aragon “organization”.
- Frontend UI and notification service should be built to inform DAO when storage is running out.
- Build native support for DAO data store initialization into @aragon/cli.
- Aragon Association payments backend must be built (could use a web2 solution like stripe or accept DAI over a smart contract).
----------

[Open Work Labs](https://www.openworklabs.com/)
