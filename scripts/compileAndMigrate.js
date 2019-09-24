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

const migrate = () =>
  new Promise((resolve, reject) => {
    exec('truffle migrate', (error, stdout) => {
      if (error) return reject(error)
      log(chalk.blue('contracts successfully migrated'))
      resolve(stdout)
    })
  })

const compileAndMigrate = async () => {
  await compile()
  await migrate()
}

module.exports = compileAndMigrate
