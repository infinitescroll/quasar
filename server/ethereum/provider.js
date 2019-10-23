const providerNetwork = process.env.BLOCKCHAIN_NETWORK || 'local'
const rinkebyInfuraHttpUrl = process.env.BLOCKCHAIN_PROVIDER_HTTP_URL || ''

let provider = 'ws://localhost:8545'
let networkId = '123'

if (providerNetwork === 'rinkeby') {
  networkId = '4'
  provider = rinkebyInfuraHttpUrl
} else if (providerNetwork === 'local') {
  networkId = '123'
  provider = 'http://localhost:8545'
}

module.exports = { provider, networkId }
