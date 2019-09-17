const IPFS = require('ipfs')
const { compileAndMigrate, startGanache } = require('./scripts')

module.exports = async () => {
  await startGanache()
  await compileAndMigrate()
  global.ipfs = await IPFS.create()
}
