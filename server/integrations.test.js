const mongoose = require('mongoose')
const request = require('supertest')
const Web3 = require('web3')
const { node } = require('./ipfs')
const {
  demoStorageRegistryContractJson,
  demoStorageContractJson1,
  demoStorageContractJson2
} = require('../mockData')
const accounts = require('../accounts.json')
const storageRegistry = require('../build/contracts/Registry.json')
const {
  StorageRegistryContract,
  StorageContract,
  Pin,
  registerPinChecker
} = require('./db')
const {
  app,
  registerStorageRegistryWatcher,
  registerPinWatcher
} = require('./index')
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
const mineBlocks = require('../utils/mineBlocks')(web3)
const sleep = require('../utils/sleep')
const { BLOCK_PADDING } = require('./constants')

let storageContract
let storageRegistryContract

let pinWatcher
let storageRegistryWatcher

const emitUnregisterContractEvent = contractAddress =>
  new Promise((resolve, reject) => {
    storageRegistryContract.methods
      .unregisterContract(contractAddress)
      .send({ from: accounts[0] }, err => {
        if (err) return reject(err)
        resolve()
      })
  })

const emitRegisterContractEvent = contractAddress =>
  new Promise((resolve, reject) => {
    storageRegistryContract.methods.registerContract(contractAddress).send(
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
    demoStorageContractJson1.abi,
    demoStorageContractJson1.address
  )

  storageRegistryContract = new web3.eth.Contract(
    storageRegistry.abi,
    storageRegistry.networks['123'].address
  )

  done()
})

beforeEach(async () => {
  pinWatcher = registerPinWatcher()
  storageRegistryWatcher = await registerStorageRegistryWatcher(
    storageRegistry.networks['123'].address
  )
  await StorageRegistryContract.findOrCreate({
    address: demoStorageRegistryContractJson.address,
    lastPolledBlock: 0
  })
})

afterEach(async () => {
  await StorageRegistryContract.deleteMany({})
  await StorageContract.deleteMany({})
})

describe('integration tests', () => {
  describe('polling mechanisms', () => {
    test('firing register event adds contract to db and begins polling, unregistering removes contract from db', done => {
      const server = app.listen('9091', async () => {
        await Promise.all([
          await emitRegisterContractEvent(demoStorageContractJson1.address),
          await emitRegisterContractEvent(demoStorageContractJson2.address)
        ])
        await mineBlocks(BLOCK_PADDING + 1)
        await sleep(1000)

        const storageContract = await StorageContract.findOne({
          address: demoStorageContractJson1.address
        })
        expect(storageContract.address).toBe(demoStorageContractJson1.address)
        expect(storageContract.sizeOfPinnedData).toBe(0)
        expect(storageContract.lastPolledBlock).toBeGreaterThan(0)
        const secondStorageContract = await StorageContract.findOne({
          address: demoStorageContractJson2.address
        })
        expect(secondStorageContract.address).toBe(
          demoStorageContractJson2.address
        )
        expect(secondStorageContract.sizeOfPinnedData).toBe(0)
        expect(secondStorageContract.lastPolledBlock).toBeGreaterThan(0)
        await emitUnregisterContractEvent(demoStorageContractJson1.address)
        await mineBlocks(BLOCK_PADDING + 1)
        await sleep(1000)

        const removedStorageContract = await StorageContract.findOne({
          address: demoStorageContractJson1.address
        })
        const nonRemovedStorageContract = await StorageContract.findOne({
          address: demoStorageContractJson2.address
        })
        expect(removedStorageContract).toBe(null)
        expect(nonRemovedStorageContract.address).toBe(
          demoStorageContractJson2.address
        )
        pinWatcher.stop()
        storageRegistryWatcher.stop()
        server.close(done)
      })
    }, 10000)
  })

  test(`emitting register event to storage registry contract, then emittting pinHash event to storage contract, removes associated document from database`, done => {
    const server = app.listen('9092', async () => {
      // set up smart contract
      await emitRegisterContractEvent(demoStorageContractJson1.address)
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
      storageRegistryWatcher.stop()
      server.close(done)
    })
  }, 10000)

  test(`registerPinChecker removes old pins`, done => {
    const server = app.listen('9093', async () => {
      const scheduler = await registerPinChecker(0, 500)
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
      storageRegistryWatcher.stop()
      server.close(done)
    })
  }, 10000)

  test(`events within BLOCK_PADDING should be ignored`, done => {
    const server = app.listen('9094', async () => {
      // set up smart contract
      await emitRegisterContractEvent(demoStorageContractJson1.address)
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
      storageRegistryWatcher.stop()
      server.close(done)
    })
  }, 10000)
})
