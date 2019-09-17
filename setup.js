const IPFS = require('ipfs')
const { compileAndMigrate, startGanache } = require('./scripts')

module.exports = async () => {
  await startGanache()
  await compileAndMigrate()
  new IPFS({
    config: {
      Addresses: {
        API: `/ip4/127.0.0.1/tcp/5001`
      }
    }
  })
}
