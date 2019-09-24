const Web3 = require('web3')
const storageJSON = require('../build/contracts/Storage.json')
const listenerJSON = require('../build/contracts/Listener.json')

const createListenEvent = () =>
  new Promise(resolve => {
    const web3 = new Web3(
      new Web3.providers.WebsocketProvider('ws://localhost:8545')
    )

    const contractToAdd = new web3.eth.Contract(
      storageJSON.abi,
      storageJSON.networks['123'].address
    )

    const listenerContract = new web3.eth.Contract(
      listenerJSON.abi,
      listenerJSON.networks['123'].address
    )
    listenerContract.methods.listenToContract(contractToAdd)

    resolve()
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
