const { compileAndMigrate, startGanache } = require('./scripts')

module.exports = async () => {
  const startedNewBlockchain = await startGanache()
  if (startedNewBlockchain) await compileAndMigrate()
}
