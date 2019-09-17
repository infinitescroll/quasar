const { abi, networks } = require('../build/contracts/Storage.json')

const demoSmartContractJson1 = {
  address: networks['123'].address,
  network: 'mainnet',
  abi
}

const demoSmartContractJson2 = {
  address: networks['456'].address,
  network: 'mainnet',
  abi
}

module.exports = {
  demoSmartContractJson1,
  demoSmartContractJson2
}