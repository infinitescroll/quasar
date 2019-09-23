const Web3 = require('web3')
const ipfsWrapper = require('../ipfs')
const smartContracts = require('../state')
const storageJSON = require('../../build/contracts/Storage.json')

const node = ipfsWrapper({
  host: process.env.IPFS_NODE_HOST ? process.env.IPFS_NODE_HOST : 'localhost',
  port: process.env.IPFS_NODE_PORT ? process.env.IPFS_NODE_PORT : '5002',
  protocol: process.env.IPFS_NODE_PROTOCOL
    ? process.env.IPFS_NODE_PROTOCOL
    : 'http',
  headers: null
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

  const newSmartContract = {
    address: event.returnValues.contractAddress,
    abi: storageJSON.abi
  }
  try {
    smartContracts.add(newSmartContract)
  } catch (err) {
    throw new Error(err)
  }
}

const registerPinWatcher = contract =>
  contract.events.PinHash({}, handlePinHashEvent)

const registerListenWatcher = contract =>
  contract.events.Listen({}, handleListenEvent)

module.exports = {
  registerPinWatcher,
  registerListenWatcher,
  getContract,
  handleListenEvent,
  handlePinHashEvent
}
