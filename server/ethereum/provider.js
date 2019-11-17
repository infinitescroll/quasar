const {
  BLOCKCHAIN_NETWORK,
  BLOCKCHAIN_PROVIDER_HTTP_URL
} = require('../constants')

let provider
let networkId

if (BLOCKCHAIN_NETWORK === 'rinkeby') {
  networkId = '4'
  provider = BLOCKCHAIN_PROVIDER_HTTP_URL
} else if (BLOCKCHAIN_NETWORK === 'mainnet') {
  networkId = '1'
  provider = BLOCKCHAIN_PROVIDER_HTTP_URL
} else {
  networkId = '123'
  provider = 'http://localhost:8545'
}

module.exports = { provider, networkId }
