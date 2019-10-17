const mongoose = require('mongoose')
// const request = require('supertest')
const Web3 = require('web3')
const { node } = require('./ipfs')
const {
  demoListenerContractJson,
  demoSmartContractJson1,
  demoSmartContractJson2
} = require('../mockData')
const accounts = require('../accounts.json')
const listenerJSON = require('../build/contracts/Listener.json')
const { ListenerContractToPoll, SmartContractToPoll, Pin } = require('./db')
const { app } = require('./index')

let web3
let storageContract
let listenerContract

const listenerUnsubscribe = contractAddress =>
  new Promise((resolve, reject) => {
    listenerContract.methods
      .unsubscribeContract(contractAddress)
      .send({ from: accounts[0] }, err => {
        if (err) reject(err)
        setTimeout(() => {
          resolve()
        }, 1000)
      })
  })

const emitListenToContractEvent = contractAddress =>
  new Promise(resolve => {
    listenerContract.methods
      .listenToContract(contractAddress)
      .send({ from: accounts[0] }, () => {
        setTimeout(() => {
          resolve()
        }, 1000)
      })
  })

const emitPinHashEvent = (key, hash) =>
  new Promise(resolve => {
    storageContract.methods
      .registerData(key, hash)
      .send({ from: accounts[0] }, () => {
        setTimeout(() => {
          resolve()
        }, 1000)
      })
  })

beforeAll(async done => {
  await mongoose.connect(process.env.DB_URL || 'mongodb://localhost/test', {
    useNewUrlParser: true
  })
  mongoose.connection.db.dropDatabase()
  web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'))
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
  await ListenerContractToPoll.create({
    address: demoListenerContractJson.address,
    lastPolledBlock: 0
  })
})

afterEach(async () => {
  await ListenerContractToPoll.deleteMany({})
  await SmartContractToPoll.deleteMany({})
})

afterAll(() => {
  web3.currentProvider.connection.close()
})

describe('integration tests', () => {
  describe('polling mechanisms', () => {
    test('firing listen event adds contract to db and begins polling, unsubscribing removes contract from db', async done => {
      const server = app.listen('9091')
      await Promise.all([
        await emitListenToContractEvent(demoSmartContractJson1.address),
        await emitListenToContractEvent(demoSmartContractJson2.address)
      ])
      const smartContractToPoll = await SmartContractToPoll.findOne({
        address: demoSmartContractJson1.address
      })
      expect(smartContractToPoll.address).toBe(demoSmartContractJson1.address)
      expect(smartContractToPoll.sizeOfPinnedData).toBe(0)
      expect(smartContractToPoll.lastPolledBlock).toBeGreaterThan(0)
      const secondSmartContractToPoll = await SmartContractToPoll.findOne({
        address: demoSmartContractJson2.address
      })
      expect(secondSmartContractToPoll.address).toBe(
        demoSmartContractJson2.address
      )
      expect(secondSmartContractToPoll.sizeOfPinnedData).toBe(0)
      expect(secondSmartContractToPoll.lastPolledBlock).toBeGreaterThan(0)
      await listenerUnsubscribe(demoSmartContractJson1.address)

      const removedSmartContractToPoll = await SmartContractToPoll.findOne({
        address: demoSmartContractJson1.address
      })
      const nonRemovedSmartContractToPoll = await SmartContractToPoll.findOne({
        address: demoSmartContractJson2.address
      })
      expect(removedSmartContractToPoll).toBe(null)
      expect(nonRemovedSmartContractToPoll.address).toBe(
        demoSmartContractJson2.address
      )
      server.close(done)
    })
  })

  test(`emitting listen event to listener contractt, then emittting pinHash event to storage contract, removes associated document from database`, async done => {
    const server = app.listen('9091')
    // set up smart contract
    await emitListenToContractEvent(demoSmartContractJson1.address)

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
    const removedPinFile = await Pin.findOne({
      cid: hash.toBaseEncodedString()
    })

    expect(removedPinFile).toBe(null)
    server.close(done)
  })
})
