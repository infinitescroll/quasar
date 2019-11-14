const mongoose = require('mongoose')
const request = require('supertest')
const Web3 = require('web3')
const { node } = require('./ipfs')
const {
  demoListenerContractJson,
  demoSmartContractJson1,
  demoSmartContractJson2
} = require('../mockData')
const accounts = require('../accounts.json')
const listenerJSON = require('../build/contracts/Listener.json')
const { ListenerContract, StorageContract, Pin } = require('./db')
const {
  app,
  autoCleanDB,
  registerListenWatcher,
  registerPinWatcher
} = require('./index')
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
const mineBlocks = require('../utils/mineBlocks')(web3)
const sleep = require('../utils/sleep')
const { BLOCK_PADDING } = require('./constants')

let storageContract
let listenerContract

let pinWatcher
let listenWatcher

const listenerUnsubscribe = contractAddress =>
  new Promise((resolve, reject) => {
    listenerContract.methods
      .unsubscribeContract(contractAddress)
      .send({ from: accounts[0] }, err => {
        if (err) return reject(err)
        resolve()
      })
  })

const emitListenToContractEvent = contractAddress =>
  new Promise((resolve, reject) => {
    listenerContract.methods.listenToContract(contractAddress).send(
      {
        from: accounts[0]
      },
      err => {
        if (err) return reject(err)
        resolve()
      }
    )
  })

const emitPinHashEvent = (key, hash) =>
  new Promise((resolve, reject) => {
    storageContract.methods.registerData(key, hash).send(
      {
        from: accounts[0]
      },
      err => {
        if (err) return reject(err)
        resolve()
      }
    )
  })

beforeAll(async done => {
  await mongoose.connect(process.env.DB_URL || 'mongodb://localhost/test', {
    useNewUrlParser: true
  })
  mongoose.connection.db.dropDatabase()
  storageContract = new web3.eth.Contract(
    demoSmartContractJson1.abi,
    demoSmartContractJson1.address
  )

  listenerContract = new web3.eth.Contract(
    listenerJSON.abi,
    listenerJSON.networks['123'].address
  )

  done()
})

beforeEach(async () => {
  pinWatcher = registerPinWatcher()
  listenWatcher = registerListenWatcher(listenerJSON.networks['123'].address)
  await ListenerContract.create({
    address: demoListenerContractJson.address,
    lastPolledBlock: 0
  })
})

afterEach(async () => {
  await ListenerContract.deleteMany({})
  await StorageContract.deleteMany({})
})

describe('integration tests', () => {
  describe('polling mechanisms', () => {
    test('firing listen event adds contract to db and begins polling, unsubscribing removes contract from db', done => {
      const server = app.listen('9091', async () => {
        await Promise.all([
          await emitListenToContractEvent(demoSmartContractJson1.address),
          await emitListenToContractEvent(demoSmartContractJson2.address)
        ])
        await mineBlocks(BLOCK_PADDING + 1)
        await sleep(1000)

        const storageContract = await StorageContract.findOne({
          address: demoSmartContractJson1.address
        })
        expect(storageContract.address).toBe(demoSmartContractJson1.address)
        expect(storageContract.sizeOfPinnedData).toBe(0)
        expect(storageContract.lastPolledBlock).toBeGreaterThan(0)
        const secondStorageContract = await StorageContract.findOne({
          address: demoSmartContractJson2.address
        })
        expect(secondStorageContract.address).toBe(
          demoSmartContractJson2.address
        )
        expect(secondStorageContract.sizeOfPinnedData).toBe(0)
        expect(secondStorageContract.lastPolledBlock).toBeGreaterThan(0)
        await listenerUnsubscribe(demoSmartContractJson1.address)
        await mineBlocks(BLOCK_PADDING + 1)
        await sleep(1000)

        const removedStorageContract = await StorageContract.findOne({
          address: demoSmartContractJson1.address
        })
        const nonRemovedStorageContract = await StorageContract.findOne({
          address: demoSmartContractJson2.address
        })
        expect(removedStorageContract).toBe(null)
        expect(nonRemovedStorageContract.address).toBe(
          demoSmartContractJson2.address
        )
        pinWatcher.stop()
        listenWatcher.stop()
        server.close(done)
      })
    }, 10000)
  })

  test(`emitting listen event to listener contract, then emittting pinHash event to storage contract, removes associated document from database`, done => {
    const server = app.listen('9092', async () => {
      // set up smart contract
      await emitListenToContractEvent(demoSmartContractJson1.address)
      await mineBlocks(BLOCK_PADDING + 1)
      await sleep(500)

      const testKey = web3.utils.fromAscii('testKey')
      const dag = { testKey: 'testVal' }
      const hash = await node.dag.put(dag)

      // manually add pin to db, to be removed later
      await Pin.create({
        size: 100,
        cid: hash.toBaseEncodedString(),
        time: new Date()
      })
      await emitPinHashEvent(testKey, hash.toBaseEncodedString())
      await mineBlocks(BLOCK_PADDING + 1)
      await sleep(500)

      const removedPinFile = await Pin.findOne({
        cid: hash.toBaseEncodedString()
      })

      expect(removedPinFile).toBe(null)
      pinWatcher.stop()
      listenWatcher.stop()
      server.close(done)
    })
  }, 10000)

  test(`registerOldPinRemover removes old pins`, done => {
    const server = app.listen('9093', async () => {
      const scheduler = await autoCleanDB(0, 500)
      const dagVal = { test: '12345' }
      const dagRequest = await request(app)
        .post('/api/v0/dag/put')
        .send(dagVal)

      expect(dagRequest.res.statusCode).toBe(201)

      const dag = await node.dag.get(dagRequest.res.text)
      expect(dag.value).toStrictEqual(dagVal)

      await sleep(1000)

      const removedPinnedDag = await Pin.findOne({
        cid: dagRequest.res.text
      })
      expect(removedPinnedDag).toBeNull()

      const pins = await node.pin.ls()
      const removedPinnedDagOnNode = pins.find(item => {
        return item.hash === dagRequest.res.text
      })
      expect(removedPinnedDagOnNode).toBe(undefined)

      scheduler.stop()
      pinWatcher.stop()
      listenWatcher.stop()
      server.close(done)
    })
  }, 10000)

  test(`events within BLOCK_PADDING should be ignored`, done => {
    const server = app.listen('9094', async () => {
      // set up smart contract
      await emitListenToContractEvent(demoSmartContractJson1.address)
      await mineBlocks(BLOCK_PADDING + 1)
      await sleep(500)

      const testKey = web3.utils.fromAscii('testKey1')
      const dag = { testKey: 'testVal1' }
      const hash = await node.dag.put(dag)

      await Pin.create({
        size: 100,
        cid: hash.toBaseEncodedString(),
        time: new Date()
      })

      await emitPinHashEvent(testKey, hash.toBaseEncodedString())
      await mineBlocks(1)
      await sleep(500)

      const optimisticallyPinnedFile = await Pin.findOne({
        cid: hash.toBaseEncodedString()
      })

      expect(optimisticallyPinnedFile).toBeTruthy()
      pinWatcher.stop()
      listenWatcher.stop()
      server.close(done)
    })
  }, 10000)
})
