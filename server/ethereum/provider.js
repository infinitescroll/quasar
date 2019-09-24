const { rinkebyInfuraWsUrl } = require('../../secrets')
const providerNetwork = process.env.BLOCKCHAIN_NETWORK

let provider
if (providerNetwork === 'rinkeby') provider = rinkebyInfuraWsUrl
if (providerNetwork === 'local') provider = 'ws://localhost:8545'

module.exports = { provider }
