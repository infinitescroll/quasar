const { exec } = require('child_process')

const compileAndMigrate = () =>
  new Promise((resolve, reject) => {
    exec('truffle compile', error => {
      if (error) return reject(error)
      exec('truffle migrate', (error, stdout) => {
        if (error) return reject(error)
        resolve(stdout)
      })
    })
  })

module.exports = compileAndMigrate
