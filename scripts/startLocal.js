const chalk = require('chalk')
const { compileAndMigrate, startGanache } = require('./')
const { startListening } = require('../server')

const log = console.log

const start = async () => {
  try {
    const startedNewBlockchain = await startGanache()
    if (startedNewBlockchain) await compileAndMigrate()
  } catch (error) {
    log(
      chalk.red(
        'Something went wrong starting the blockchain or compiling and migrating your contracts'
      )
    )
  }

  startListening()
}

start()
