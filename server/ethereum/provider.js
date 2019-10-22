const providerNetwork = process.env.BLOCKCHAIN_NETWORK || 'local'
const rinkebyInfuraHttpUrl = process.env.RINKEBY_PROVIDER_HTTP_URL || ''
const mainnetInfuraHttpUrl = process.env.MAINNET_PROVIDER_HTTP_URL || ''

let provider
let networkId

if (providerNetwork === 'rinkeby') {
  networkId = '4'
  provider = rinkebyInfuraHttpUrl
} else if (providerNetwork === 'mainnet') {
  networkId = '1'
  provider = mainnetInfuraHttpUrl
} else {
  networkId = '123'
  provider = 'http://localhost:8545'
}

module.exports = { provider, networkId }
