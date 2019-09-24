const { abi, networks } = require('../build/contracts/Storage.json')

const demoSmartContractJson1 = {
  address: networks['123'].address,
  abi
}

const address2 = networks['123'].address.slice(0, -1) + 'z'
const demoSmartContractJson2 = {
  address: address2,
  abi
}

module.exports = {
  demoSmartContractJson1,
  demoSmartContractJson2
}
