const ganache = require('ganache-cli')
const fs = require('fs')
const isPortTaken = require('./isPortTaken')

const startGanache = () =>
  new Promise(async (resolve, reject) => {
    const blockchainRunning = await isPortTaken('8545')
    if (!blockchainRunning) {
      const server = ganache.server({ network_id: 123, block_time: 3 })
      server.listen(8545, (err, blockchain) => {
        if (err) return reject(err)
        fs.writeFile(
          './accounts.json',
          JSON.stringify(Object.keys(blockchain.accounts)),
          error => {
            if (err) reject(error)
            return resolve(true)
          }
        )
      })
    } else {
      resolve(false)
    }
  })

module.exports = startGanache
