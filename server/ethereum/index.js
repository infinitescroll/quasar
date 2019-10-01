const Web3 = require('web3')
const ipfsWrapper = require('../ipfs')
const smartContracts = require('../state')
const storageJSON = require('../../build/contracts/Storage.json')

const node = ipfsWrapper({
  host: process.env.IPFS_NODE_HOST || 'localhost',
  port: process.env.IPFS_NODE_PORT || '5001',
  protocol: process.env.IPFS_NODE_PROTOCOL || 'http',
  headers: process.env.IPFS_AUTH
    ? {
        Authorization: process.env.IPFS_AUTH
      }
    : null,
  apiPath: process.env.IPFS_API_PATH || '/ipfs/api/v0/'
})

const web3 = new Web3(
  new Web3.providers.WebsocketProvider('ws://localhost:8545')
)

const getContract = smartContractObj => {
  return new web3.eth.Contract(smartContractObj.abi, smartContractObj.address)
}

const handlePinHashEvent = async (err, event) => {
  if (err) console.error('Error subscribing: ', err)
  try {
    const result = await node.getAndPin(event.returnValues.cid)
    if (!result[0]) throw new Error('no result found')
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const handleListenEvent = async (err, event) => {
  if (err) console.error('Error subcribing: ', err)
  const contract = new web3.eth.Contract(
    storageJSON.abi,
    event.returnValues.contractAddress
  )

  const smartContractObj = {
    address: event.returnValues.contractAddress,
    abi: storageJSON.abi
  }
  try {
    smartContracts.add(smartContractObj)
    registerPinWatcher(contract)
  } catch (err) {
    throw new Error(err)
  }
}

const handleStopListeningEvent = async (err, event) => {
  if (err) console.error('Error subcribing: ', err)
  smartContracts.unsubscribe(event.returnValues.contractAddress)
}

const registerPinWatcher = contract =>
  contract.events.PinHash({}, handlePinHashEvent)

const registerListenWatcher = contract =>
  contract.events.Listen({}, handleListenEvent)

const registerStopListeningWatcher = contract =>
  contract.events.StopListening({}, handleStopListeningEvent)

module.exports = {
  registerPinWatcher,
  registerListenWatcher,
  registerStopListeningWatcher,
  getContract,
  handleListenEvent,
  handlePinHashEvent
}
