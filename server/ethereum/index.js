const Web3 = require('web3')
const ipfs = require('../ipfs')
const smartContracts = require('../state')
const storageJSON = require('../../build/contracts/Storage.json')
const { SmartContractToPoll } = require('../db')

const { provider } = require('./provider')

const web3 = new Web3(new Web3.providers.WebsocketProvider(provider))

const getContract = smartContractObj => {
  return new web3.eth.Contract(smartContractObj.abi, smartContractObj.address)
}

const handlePinHashEvent = async (err, event) => {
  if (err) console.error('Error subscribing: ', err)
  try {
    const result = await ipfs.getAndPin(event.returnValues.cid)
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

  try {
    const listener = registerPinWatcher(contract)
    // lines 36-40 will be removed
    const smartContractObj = {
      address: event.returnValues.contractAddress,
      listener
    }
    smartContracts.add(smartContractObj)

    await SmartContractToPoll.create({
      address: event.returnValues.contractAddress,
      lastPolledBlock: 0,
      sizeOfPinnedData: 0
    })
  } catch (err) {
    throw new Error(err)
  }
}

const handleStopListeningEvent = async (err, event) => {
  if (err) console.error('Error unsubcribing: ', err)
  await SmartContractToPoll.deleteOne({
    address: event.returnValues.contractAddress
  })
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
  handlePinHashEvent,
  handleStopListeningEvent,
  web3
}
