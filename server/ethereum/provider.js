const { rinkebyInfuraWsUrl } = require('../../secrets')
const providerNetwork = process.env.BLOCKCHAIN_NETWORK

let provider, networkId

if (providerNetwork === 'rinkeby') {
  networkId = '4'
  provider = rinkebyInfuraWsUrl
}
if (providerNetwork === 'local') {
  networkId = '123'
  provider = 'ws://localhost:8545'
}

module.exports = { provider, networkId }
