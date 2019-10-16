const { networks, abi } = require('../build/contracts/Storage.json')
const listenerJSON = require('../build/contracts/Listener.json')

const demoSmartContractJson1 = {
  address: networks['123'].address,
  abi
}

const address2 = '0x99E331Fa7c45671643666715309a176Ea4EEf919'
const demoSmartContractJson2 = {
  address: address2,
  abi
}

const demoListenerContractJson = {
  abi: listenerJSON.abi,
  address: listenerJSON.networks['123'].address
}

module.exports = {
  demoSmartContractJson1,
  demoSmartContractJson2,
  demoListenerContractJson
}
