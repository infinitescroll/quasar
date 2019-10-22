const Web3 = require('web3')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const storageJSON = require('../build/contracts/Storage.json')
const listenerJSON = require('../build/contracts/Listener.json')
const accounts = require('../accounts.json')
const { provider, networkId } = require('../server/ethereum/provider')

const web3Provider =
  provider === 'rinkeby'
    ? new HDWalletProvider(
        process.env.MNEMONIC,
        process.env.RINKEBY_PROVIDER_HTTP_URL,
        1
      )
    : new Web3.providers.WebsocketProvider('ws://localhost:8545')

const createListenEvent = () =>
  new Promise((resolve, reject) => {
    const web3 = new Web3(web3Provider)
    web3.eth.getAccounts((err, [account]) => {
      if (err) return reject(err)
      const listenerContract = new web3.eth.Contract(
        listenerJSON.abi,
        listenerJSON.networks[networkId].address
      )

      listenerContract.methods
        .listenToContract(storageJSON.networks[networkId].address)
        .send(
          { from: provider === 'rinkeby' ? account : accounts[0] },
          (error, res) => {
            if (error) reject(error)
            resolve(res)
          }
        )
    })
  })

const start = async () => {
  try {
    const res = await createListenEvent()
    console.log('tx successfully completed: ', res)
  } catch (error) {
    console.log('tx unsuccessfull, error: ', error)
  }
  process.exit(0)
}

start()
