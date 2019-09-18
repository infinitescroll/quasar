const ganache = require('ganache-cli')
const fs = require('fs')
const isPortTaken = require('./isPortTaken')

const startGanache = () =>
  new Promise(async (resolve, reject) => {
    const shouldStartNewServer = await isPortTaken('8545')
    if (shouldStartNewServer) {
      const server = ganache.server({ network_id: 123, block_time: 3 })
      server.listen(8545, (err, blockchain) => {
        if (err) reject(err)
        fs.writeFile(
          './accounts.json',
          JSON.stringify(Object.keys(blockchain.accounts)),
          error => {
            if (err) reject(error)
            resolve(true)
          }
        )
      })
    }
    resolve(false)
  })

module.exports = startGanache
