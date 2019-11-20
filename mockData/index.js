const { networks, abi } = require('../build/contracts/Storage.json')
const storageRegistry = require('../build/contracts/Registry.json')

const demoStorageContractJson1 = {
  address: networks['123'].address,
  abi
}

const address2 = '0x99E331Fa7c45671643666715309a176Ea4EEf919'
const demoStorageContractJson2 = {
  address: address2,
  abi
}

const demoStorageRegistryContractJson = {
  abi: storageRegistry.abi,
  address: storageRegistry.networks['123'].address
}

module.exports = {
  demoStorageContractJson1,
  demoStorageContractJson2,
  demoStorageRegistryContractJson
}
