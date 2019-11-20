const storageRegistryAddress = require('../build/contracts/Registry.json')
  .networks['123'].address

process.env.STORAGE_REGISTRY_CONTRACT_ADDRESS = storageRegistryAddress
