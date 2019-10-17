const providerNetwork = process.env.BLOCKCHAIN_NETWORK || 'local'
const rinkebyInfuraWsUrl = process.env.RINKEBY_PROVIDER_WS_URL || ''

let provider = 'ws://localhost:8545'
let networkId = '123'

if (providerNetwork === 'rinkeby') {
  networkId = '4'
  provider = rinkebyInfuraWsUrl
} else if (providerNetwork === 'local') {
  networkId = '123'
  provider = 'http://localhost:8545'
}

module.exports = { provider, networkId }
