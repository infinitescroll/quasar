const { abi, networks } = require('../build/contracts/Storage.json')

const demoSmartContractJson1 = {
  address: networks['123'].address,
  abi
}

const demoSmartContractJson2 = {
  address: networks['123'].address.replace('0', '1'),
  abi
}

module.exports = {
  demoSmartContractJson1,
  demoSmartContractJson2
}
