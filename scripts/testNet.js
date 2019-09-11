const ganache = require('ganache-cli')
const fs = require('fs')

const start = () => {
  const server = ganache.server({ network_id: 123, block_time: 3 })
  server.listen(8545, (err, blockchain) => {
    if (err) throw new Error(err)
    fs.writeFile(
      './accounts.json',
      JSON.stringify(Object.keys(blockchain.accounts)),
      error => {
        if (err) throw new Error(error)
        console.log('SUCCESSFULLY RETRIEVED ACCOUNTS')
      }
    )
  })
}

start()
