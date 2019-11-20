const Web3 = require('web3')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const storageJSON = require('../build/contracts/Storage.json')
const mineBlocks = require('../utils/mineBlocks')

require('dotenv').config()
const network = process.env.BLOCKCHAIN_NETWORK

const web3Provider =
  network === 'rinkeby'
    ? new HDWalletProvider(
        process.env.MNEMONIC,
        process.env.BLOCKCHAIN_PROVIDER_HTTP_URL,
        1
      )
    : new Web3.providers.HttpProvider('http://localhost:8545')

const web3 = new Web3(web3Provider)

const mine = mineBlocks(web3)

const createPinEvent = () =>
  new Promise((resolve, reject) => {
    web3.eth.getAccounts((err, accounts) => {
      if (err) return reject(err)

      const testKey = web3.utils.fromAscii('testKey')

      const contract = new web3.eth.Contract(
        storageJSON.abi,
        storageJSON.networks[network === 'rinkeby' ? '4' : '123'].address
      )

      contract.methods
        .registerData(testKey, 'qm123')
        .send({ from: accounts[0] }, async (error, res) => {
          if (error) reject(error)
          await mine(5)

          resolve(res)
        })
    })
  })

const start = async () => {
  try {
    const txHash = await createPinEvent()
    const tx = await web3.eth.getTransaction(txHash)
    console.log('tx successfully completed: ', tx)
  } catch (error) {
    console.log('tx unsuccessfull, error: ', error)
  }
  process.exit(0)
}

start()
