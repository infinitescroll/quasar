const Web3 = require('web3')
const Promise = require('bluebird')
const { StorageRegistryContract, StorageContract, Pin } = require('../db')
const { provider } = require('./provider')
const Scheduler = require('../scheduler')
const emptyScheduler = require('../scheduler/emptyScheduler')
const {
  STORAGE_REGISTRY_CONTRACT_ABI,
  STORAGE_CONTRACT_ABI,
  CONTRACT_POLL_INTERVAL,
  log,
  BLOCK_PADDING
} = require('../constants')

require('dotenv').config()
const web3 = new Web3(new Web3.providers.HttpProvider(provider))

const getContract = smartContractObj => {
  return new web3.eth.Contract(smartContractObj.abi, smartContractObj.address)
}

const logEvents = (contractType, contractAddress, events) => {
  if (events.length > 0) {
    log(
      `Found ${
        events.length
      } events from contract: ${contractType} at address ${contractAddress}: ${JSON.stringify(
        events,
        null,
        2
      )}`
    )
  } else {
    log(
      `No events found for contract: ${contractType} at address: ${contractAddress}`
    )
  }
}

const handlePinHashEvent = event => {
  log(
    `Request to pin ${event.returnValues.cid} received from contract ${event.address}`
  )
  return Pin.deleteMany({ cid: event.returnValues.cid })
}

const handleStorageRegistryEvent = async ({ event, returnValues }) => {
  if (event === 'Register') {
    log(`Added contract ${returnValues.contractAddress} to listen to`)
    return StorageContract.findOrCreate({
      address: returnValues.contractAddress
    })
  } else if (event === 'Unregister') {
    log(
      'No longer listening to smart contract at ',
      returnValues.contractAddress
    )
    return StorageContract.deleteOne({
      address: returnValues.contractAddress
    })
  } else {
    log(
      'unhandled storage registry event: ',
      event,
      ' with return values: ',
      returnValues
    )
  }
}

const registerPinWatcher = () =>
  new Scheduler(async () => {
    const latestBlock = (await web3.eth.getBlockNumber()) - BLOCK_PADDING
    const storageContracts = await StorageContract.find({})
    await Promise.all(
      storageContracts.map(async contract => {
        const web3Contract = new web3.eth.Contract(
          STORAGE_CONTRACT_ABI,
          contract.address
        )

        // mostly for test suites - make sure we are gathering information from new blocks
        if (latestBlock - contract.lastPolledBlock > 0) {
          const events = await web3Contract.getPastEvents('PinHash', {
            fromBlock:
              contract.lastPolledBlock === 0 ? 0 : contract.lastPolledBlock + 1,
            toBlock: latestBlock
          })
          logEvents('storage', contract.address, events)
          await Promise.all(events.map(handlePinHashEvent))
          await contract.update({ lastPolledBlock: latestBlock })
        }
      })
    )
  }, CONTRACT_POLL_INTERVAL)

const registerStorageRegistryWatcher = async address => {
  if (address) {
    await StorageRegistryContract.findOrCreate({ address })

    return new Scheduler(async () => {
      const latestBlock = (await web3.eth.getBlockNumber()) - BLOCK_PADDING
      const storageRegistrys = await StorageRegistryContract.find({})
      await Promise.all(
        storageRegistrys.map(async contract => {
          const web3Contract = new web3.eth.Contract(
            STORAGE_REGISTRY_CONTRACT_ABI,
            contract.address
          )

          // mostly for test suites - make sure we are gathering information from new blocks
          if (latestBlock - contract.lastPolledBlock > 0) {
            const fromBlock =
              contract.lastPolledBlock === 0 ? 0 : contract.lastPolledBlock
            const events = await web3Contract.getPastEvents('allEvents', {
              fromBlock,
              toBlock: latestBlock
            })
            logEvents('storage registry', contract.address, events)
            await Promise.mapSeries(events, handleStorageRegistryEvent)
            await contract.update({ lastPolledBlock: latestBlock })
          }
        })
      )
    }, CONTRACT_POLL_INTERVAL)
  }
  log(
    'No storage registry contract address passed to registerStorageRegistry Watcher. Not listening.'
  )
  return emptyScheduler
}

module.exports = {
  registerPinWatcher,
  registerStorageRegistryWatcher,
  getContract,
  handleStorageRegistryEvent,
  handlePinHashEvent,
  web3
}
