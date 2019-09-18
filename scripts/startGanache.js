const ganache = require('ganache-cli')
const fs = require('fs')

const startGanache = () =>
  new Promise((resolve, reject) => {
    const server = ganache.server({ network_id: 123, block_time: 3 })
    server.listen(8545, (err, blockchain) => {
      if (err) return reject(err)
      fs.writeFile(
        './accounts.json',
        JSON.stringify(Object.keys(blockchain.accounts)),
        error => {
          if (err) reject(error)
          resolve(blockchain)
        }
      )
    })
  })

module.exports = startGanache
