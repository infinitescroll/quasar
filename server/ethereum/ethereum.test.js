const mongoose = require('mongoose')
const {
  handleStorageRegistryEvent,
  handlePinHashEvent,
  registerPinWatcher,
  registerStorageRegistryWatcher
} = require('./')

const { node } = require('../ipfs')
const {
  demoStorageRegistryContractJson,
  demoStorageContractJson1,
  demoStorageContractJson2
} = require('../../mockData')
const { StorageRegistryContract, StorageContract, Pin } = require('../db')
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
  describe('registerStorageRegistryWatcher', () => {
    test('registerStorageRegistryWatcher returns an instance of the scheduler', async done => {
      const storageRegistryWatcher = await registerStorageRegistryWatcher(
        demoStorageRegistryContractJson.address
      )
      storageRegistryWatcher.stop()
      expect(storageRegistryWatcher instanceof Scheduler).toBe(true)
      done()
    })

    test('registerStorageRegistryWatcher does not return an instance of the scheduler when no address is passed', async done => {
      const storageRegistryWatcher = await registerStorageRegistryWatcher()
      storageRegistryWatcher.stop()
      expect(storageRegistryWatcher instanceof Scheduler).toBe(false)
      done()
    })

    test('registerStorageRegistryWatcher polls database and updates last polled block on each contract', async done => {
      const storageRegistryWatcher = await registerStorageRegistryWatcher(
        demoStorageRegistryContractJson.address
      )
      const storageRegistry = await StorageRegistryContract.findOrCreate({
        address: demoStorageRegistryContractJson.address
      })

      await mineBlocks(1)
      await sleep(1000)

      const updatedContract = await StorageRegistryContract.findById(
        storageRegistry._id
      )

      expect(updatedContract.lastPolledBlock).toBeGreaterThan(0)
      storageRegistryWatcher.stop()
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
      const firstStorageContract = await StorageContract.create({
        address: demoStorageContractJson1.address,
        lastPolledBlock: 0,
        sizeOfPinnedData: 0
      })

      const secondStorageContract = await StorageContract.create({
        address: demoStorageContractJson2.address,
        lastPolledBlock: 0,
        sizeOfPinnedData: 0
      })

      await mineBlocks(1)
      await sleep(1000)

      const updatedFirstContractInDB = await StorageContract.findById(
        firstStorageContract._id
      )
      const updatedSecondContractInDB = await StorageContract.findById(
        secondStorageContract._id
      )
      expect(updatedFirstContractInDB.lastPolledBlock).toBeGreaterThan(0)
      expect(updatedSecondContractInDB.lastPolledBlock).toBeGreaterThan(0)
      pinWatcher.stop()
      done()
    })
  })

  describe('handlers', () => {
    test('handleStorageRegistryEvent adds smart contract to database when event type is "Register"', async done => {
      const eventObj = {
        event: 'Register',
        returnValues: { contractAddress: demoStorageContractJson1.address }
      }

      await handleStorageRegistryEvent(eventObj)
      const storageContract = await StorageContract.findOne({
        address: demoStorageContractJson1.address
      })
      expect(storageContract.address).toBe(demoStorageContractJson1.address)
      expect(storageContract.sizeOfPinnedData).toBe(0)
      expect(storageContract.lastPolledBlock).toBe(0)
      done()
    })

    test('handleStorageRegistryEvent removes smart contract from database when event type is "Unregister"', async done => {
      await StorageContract.create({
        address: demoStorageContractJson1.address,
        lastPolledBlock: 0,
        sizeOfPinnedData: 0
      })

      const eventObj = {
        event: 'Unregister',
        returnValues: { contractAddress: demoStorageContractJson1.address }
      }

      await handleStorageRegistryEvent(eventObj)
      const storageContract = await StorageContract.findOne({
        address: demoStorageContractJson1.address
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
