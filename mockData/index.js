const { abi, networks } = require('../build/contracts/Storage.json')

const demoSmartContractJson = {
  address: networks['123'].address,
  network: 'mainnet',
  abi
}

module.exports = {
  demoSmartContractJson
}
