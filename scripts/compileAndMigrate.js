const { exec } = require('child_process')
const chalk = require('chalk')
const log = console.log

const compile = () =>
  new Promise((resolve, reject) => {
    exec('truffle compile', error => {
      if (error) return reject(error)
      log(chalk.blue('contracts successfully compiled'))
      resolve(true)
    })
  })

const migrate = (network = '') =>
  new Promise((resolve, reject) => {
    const migrateCmd =
      network !== 'local'
        ? `truffle migrate --network ${network}`
        : 'truffle migrate'
    log(chalk.green(`running ${migrateCmd}`))

    exec(migrateCmd, (error, stdout) => {
      if (error) return reject(error)
      log(chalk.blue('contracts successfully migrated'))
      resolve(stdout)
    })
  })

const compileAndMigrate = async network => {
  await compile()
  await migrate(network)
  return
}

module.exports = compileAndMigrate
