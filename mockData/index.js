const { abi, networks } = require('../build/contracts/Storage.json')

const demoSmartContractJson1 = {
  address: networks['123'].address,
  abi
}

const address2 = '0x99E331Fa7c45671643666715309a176Ea4EEf919'
const demoSmartContractJson2 = {
  address: address2,
  abi
}

module.exports = {
  demoSmartContractJson1,
  demoSmartContractJson2
}
