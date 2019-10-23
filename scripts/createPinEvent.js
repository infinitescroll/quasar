const Web3 = require('web3')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const storageJSON = require('../build/contracts/Storage.json')
const accounts = require('../accounts.json')

require('dotenv').config()
const network = process.env.BLOCKCHAIN_NETWORK
const web3Provider =
  network === 'rinkeby'
    ? new HDWalletProvider(
        process.env.MNEMONIC,
        process.env.RINKEBY_PROVIDER_HTTP_URL,
        1
      )
    : new Web3.providers.WebsocketProvider('ws://localhost:8545')

const createPinEvent = () =>
  new Promise((resolve, reject) => {
    const web3 = new Web3(web3Provider)
    web3.eth.getAccounts((err, gotAccounts) => {
      if (err) return reject(err)

      const testKey = web3.utils.fromAscii('testKey')

      const contract = new web3.eth.Contract(
        storageJSON.abi,
        storageJSON.networks[network === 'rinkeby' ? '4' : '123'].address
      )

      contract.methods
        .registerData(testKey, 'qm123')
        .send(
          { from: network === 'rinkeby' ? gotAccounts[0] : accounts[0] },
          (error, res) => {
            if (error) reject(error)
            resolve(res)
          }
        )
    })
  })

const start = async () => {
  try {
    const res = await createPinEvent()
    console.log('tx successfully completed: ', res)
  } catch (error) {
    console.log('tx unsuccessfull, error: ', error)
  }
  process.exit(0)
}

start()
