const ganache = require('ganache-cli')
const fs = require('fs')
const isPortTaken = require('./isPortTaken')
const chalk = require('chalk')
const log = console.log
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
const mineBlock = require('../utils/mineBlocks')(web3)
const { BLOCK_PADDING } = require('../server/constants')

const startGanache = () =>
  new Promise(async (resolve, reject) => {
    const blockchainRunning = await isPortTaken('8545')
    if (!blockchainRunning) {
      const server = ganache.server({ network_id: 123 })
      server.listen(8545, async (err, blockchain) => {
        if (err) return reject(err)
        await mineBlock(BLOCK_PADDING + 1)
        fs.writeFile(
          './accounts.json',
          JSON.stringify(Object.keys(blockchain.accounts)),
          error => {
            if (err) reject(error)
            log(chalk.blue('Testnet successfully started and accounts printed'))
            return resolve(true)
          }
        )
      })
    } else {
      resolve(false)
    }
  })

module.exports = startGanache
