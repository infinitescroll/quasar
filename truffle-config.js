const HDWalletProvider = require('@truffle/hdwallet-provider')
require('dotenv').config()
const mnemonic = process.env.MNEMONIC || ''
const rinkebyProviderHTTPUrl = process.env.BLOCKCHAIN_PROVIDER_HTTP_URL || ''

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*' // Match any network id
    },
    rinkeby: {
      network_id: 4,
      provider: () => new HDWalletProvider(mnemonic, rinkebyProviderHTTPUrl, 1)
    }
  },
  compilers: {
    solc: {
      version: '0.4.24+commit.e67f0147'
    }
  }
}
