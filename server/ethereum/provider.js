const providerNetwork = process.env.BLOCKCHAIN_NETWORK || 'local'
const blockchainHttpUrl = process.env.BLOCKCHAIN_PROVIDER_HTTP_URL || ''

let provider
let networkId

if (providerNetwork === 'rinkeby') {
  networkId = '4'
  provider = blockchainHttpUrl
} else if (providerNetwork === 'mainnet') {
  networkId = '1'
  provider = blockchainHttpUrl
} else {
  networkId = '123'
  provider = 'http://localhost:8545'
}

module.exports = { provider, networkId }
