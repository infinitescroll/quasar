const chalk = require('chalk')
const { compileAndMigrate, startGanache } = require('.')
const { startListening } = require('../server')

const log = console.log

const start = async () => {
  try {
    let startedNewBlockchain = false
    if (
      process.env.BLOCKCHAIN_NETWORK === 'local' ||
      !process.env.BLOCKCHAIN_NETWORK
    ) {
      startedNewBlockchain = await startGanache()
    }
    if (process.env.BLOCKCHAIN_NETWORK === 'rinkeby' || startedNewBlockchain)
      await compileAndMigrate(process.env.BLOCKCHAIN_NETWORK)
  } catch (error) {
    log(
      chalk.red(
        'Something went wrong starting the blockchain or compiling and migrating your contracts: ',
        error
      )
    )
  }

  startListening()
}

start()
