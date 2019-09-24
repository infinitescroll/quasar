const { networks, abi } = require('../build/contracts/Storage.json')

const demoSmartContractJson1 = {
  address: networks['123'].address,
  listener: {
    unsubscribe: () => console.log('unsubscribing')
  },
  abi
}

const address2 = '0x99E331Fa7c45671643666715309a176Ea4EEf919'
const demoSmartContractJson2 = {
  address: address2,
  listener: {
    unsubscribe: () => console.log('unsubscribing')
  },
  abi
}

module.exports = {
  demoSmartContractJson1,
  demoSmartContractJson2
}
