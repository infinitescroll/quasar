const mongoose = require('mongoose')
const {
  handleListenEvent,
  handlePinHashEvent,
  registerPinWatcher,
  registerListenWatcher
} = require('./')

const { node } = require('../ipfs')
const {
  demoListenerContractJson,
  demoSmartContractJson1,
  demoSmartContractJson2
} = require('../../mockData')
const { ListenerContractToPoll, StorageContract, Pin } = require('../db')
const Scheduler = require('../scheduler')
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
const mineBlocks = require('../../utils/mineBlocks')(web3)
const sleep = require('../../utils/sleep')

beforeAll(async done => {
  await mongoose.connect(process.env.DB_URL || 'mongodb://localhost/test', {
    useNewUrlParser: true
  })
  mongoose.connection.db.dropDatabase()
  done()
})

beforeEach(async () => {
  await StorageContract.deleteMany({})
})

describe('unit tests', () => {
  describe('registerListenWatcher', () => {
    test('registerListenWatcher returns an instance of the scheduler', () => {
      const listenerWatcher = registerListenWatcher(
        demoListenerContractJson.address
      )
      listenerWatcher.stop()
      expect(listenerWatcher instanceof Scheduler).toBe(true)
    })

    test('registerListenWatcher does not return an instance of the scheduler when no address is passed', () => {
      const listenerWatcher = registerListenWatcher()
      listenerWatcher.stop()
      expect(listenerWatcher instanceof Scheduler).toBe(false)
    })

    test('registerListenWatcher polls database and updates last polled block on each contract', async done => {
      const listenWatcher = registerListenWatcher(
        demoListenerContractJson.address
      )
      const listenerContract = await ListenerContractToPoll.create({
        address: demoListenerContractJson.address,
        lastPolledBlock: 0
      })

      await mineBlocks(1)
      await sleep(1000)

      const updatedContract = await ListenerContractToPoll.findById(
        listenerContract._id
      )

      expect(updatedContract.lastPolledBlock).toBeGreaterThan(0)
      listenWatcher.stop()
      done()
    })
  })

  describe('registerPinWatcher', () => {
    test('registerPinWatcher returns an instance of the scheduler', () => {
      const pinWatcher = registerPinWatcher()
      pinWatcher.stop()
      expect(pinWatcher instanceof Scheduler).toBe(true)
    })

    test('registerPinWatcher polls database and updates last polled block on each contract', async done => {
      const pinWatcher = registerPinWatcher()
      const firstContractToPoll = await StorageContract.create({
        address: demoSmartContractJson1.address,
        lastPolledBlock: 0,
        sizeOfPinnedData: 0
      })

      const secondContractToPoll = await StorageContract.create({
        address: demoSmartContractJson2.address,
        lastPolledBlock: 0,
        sizeOfPinnedData: 0
      })

      await mineBlocks(1)
      await sleep(1000)

      const updatedFirstContractInDB = await StorageContract.findById(
        firstContractToPoll._id
      )
      const updatedSecondContractInDB = await StorageContract.findById(
        secondContractToPoll._id
      )
      expect(updatedFirstContractInDB.lastPolledBlock).toBeGreaterThan(0)
      expect(updatedSecondContractInDB.lastPolledBlock).toBeGreaterThan(0)
      pinWatcher.stop()
      done()
    })
  })

  describe('handlers', () => {
    test('handleListenEvent adds smart contract to database when event type is "Listen"', async done => {
      const eventObj = {
        event: 'Listen',
        returnValues: { contractAddress: demoSmartContractJson1.address }
      }

      await handleListenEvent(eventObj)
      const storageContract = await StorageContract.findOne({
        address: demoSmartContractJson1.address
      })
      expect(storageContract.address).toBe(demoSmartContractJson1.address)
      expect(storageContract.sizeOfPinnedData).toBe(0)
      expect(storageContract.lastPolledBlock).toBe(0)
      done()
    })

    test('handleListenEvent removes smart contract from database when event type is "StopListening"', async done => {
      await StorageContract.create({
        address: demoSmartContractJson1.address,
        lastPolledBlock: 0,
        sizeOfPinnedData: 0
      })

      const eventObj = {
        event: 'StopListening',
        returnValues: { contractAddress: demoSmartContractJson1.address }
      }

      await handleListenEvent(eventObj)
      const storageContract = await StorageContract.findOne({
        address: demoSmartContractJson1.address
      })
      expect(storageContract).toBe(null)
      done()
    })

    test('handlePinHashEvent removes file from database by cid', async done => {
      const dagA = { firstTestKey: 'firstTestVal' }
      const cidA = await node.dag.put(dagA)
      const dagB = { secondTestKey: 'secondTestVal' }
      const cidB = await node.dag.put(dagB)

      const eventObj = {
        returnValues: {
          cid: cidA.toBaseEncodedString()
        }
      }

      await Pin.create({
        size: 100,
        cid: cidA.toBaseEncodedString(),
        time: new Date()
      })

      await Pin.create({
        size: 100,
        cid: cidB.toBaseEncodedString(),
        time: new Date()
      })

      await handlePinHashEvent(eventObj)

      const removedCid = await Pin.find({
        cid: cidA.toBaseEncodedString()
      })
      expect(removedCid.length).toBe(0)
      const storedCid = await Pin.find({ cid: cidB.toBaseEncodedString() })
      expect(storedCid.length).toBe(1)
      done()
    })
  })
})
