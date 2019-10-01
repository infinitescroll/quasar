const Web3 = require('web3')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const storageJSON = require('../build/contracts/Storage.json')
const accounts = require('../accounts.json')
const { mnemonic, rinkebyProviderHTTPUrl } = require('../secrets')
const { provider, networkId } = require('../server/ethereum/provider')

const web3Provider =
  provider === 'rinkeby'
    ? new HDWalletProvider(mnemonic, rinkebyProviderHTTPUrl, 1)
    : new Web3.providers.WebsocketProvider('ws://localhost:8545')

const createPinEvent = () =>
  new Promise((resolve, reject) => {
    const web3 = new Web3(web3Provider)

    const testKey = web3.utils.fromAscii('testKey')

    const contract = new web3.eth.Contract(
      storageJSON.abi,
      storageJSON.networks[networkId].address
    )

    contract.methods
      .registerData(testKey, 'qm123')
      .send({ from: accounts[0] }, (error, res) => {
        if (error) reject(error)
        resolve(res)
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
