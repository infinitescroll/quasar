const { abi, networks } = require('../build/contracts/Storage.json')

const demoSmartContract = {
  address: networks['123'].address,
  network: 'mainnet',
  abi
}

module.exports = {
  demoSmartContract
}
