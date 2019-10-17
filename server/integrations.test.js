const mongoose = require('mongoose')
const request = require('supertest')
const Web3 = require('web3')
const {
  registerPinWatcher,
  registerListenWatcher,
  handleListenEvent,
  handleStopListeningEvent,
  handlePinHashEvent
} = require('./ethereum')

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

const removeHashIfPinned = async cid => {
  const pins = await node.pin.ls()
  const match = pins.find(item => item.hash === cid)
  if (match) return node.pin.rm(match.hash)
  return
}

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
      const listenWatcher = registerListenWatcher()
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
      listenWatcher.stop()
      done()
    })
  })
  // test(`emitting listen event from listener, then emittting pin event
  // from pinning contract keeps file pinned`, async done => {
  //   const testKey = web3.utils.fromAscii('testKey')
  //   const dag = { testKey: 'testVal' }
  //   const hash = await node.dag.put(dag)
  //   await removeHashIfPinned(hash.toBaseEncodedString())
  //   await emitListenToContractEvent(demoSmartContractJson1.address)
  //   contract.methods
  //     .registerData(testKey, hash.toBaseEncodedString())
  //     .send({ from: accounts[0] }, () => {
  //       setTimeout(async () => {
  //         const pins = await node.pin.ls()
  //         const match = pins.find(
  //           item => item.hash === hash.toBaseEncodedString()
  //         )
  //         expect(match).toBeDefined()
  //         done()
  //       }, 2200)
  //     })
  // }, 7500)

  // test('registerPinWatcher polls database and updates last polled block on each contract', async done => {
  //   const firstContractToPoll = await SmartContractToPoll.create({
  //     address: demoSmartContractJson1.address,
  //     lastPolledBlock: 0,
  //     sizeOfPinnedData: 0
  //   })

  //   const secondContractToPoll = await SmartContractToPoll.create({
  //     address: demoSmartContractJson2.address,
  //     lastPolledBlock: 0,
  //     sizeOfPinnedData: 0
  //   })

  //   const testKey = web3.utils.fromAscii('testKey')
  //   const dag = { testKey: 'testVal' }
  //   const hash = await node.dag.put(dag)
  //   storageContract.methods
  //     .registerData(testKey, hash.toBaseEncodedString())
  //     .send({ from: accounts[0] }, () => {
  //       registerPinWatcher()

  //       setTimeout(async () => {
  //         const updatedFirstContractInDB = await SmartContractToPoll.findById(
  //           firstContractToPoll._id
  //         )
  //         const updatedSecondContractInDB = await SmartContractToPoll.findById(
  //           secondContractToPoll._id
  //         )
  //         expect(updatedFirstContractInDB.lastPolledBlock).toBeGreaterThan(0)
  //         expect(updatedSecondContractInDB.lastPolledBlock).toBeGreaterThan(0)
  //         done()
  //       }, 100)
  //     })
  // })

  // test('registerListenWatcher polls database and updates last polled block on each contract', async done => {
  //   await ListenerContractToPoll.create({
  //     address: demoListenerContractJson.address,
  //     lastPolledBlock: 0
  //   })
  //   listenerContract.methods
  //     .listenToContract(demoSmartContractJson1.address)
  //     .send({ from: accounts[0] }, () => {
  //       listenerContract.methods
  //         .unsubscribeContract(demoSmartContractJson1.address)
  //         .send({ from: accounts[0] }, () => {
  //           registerListenWatcher()
  //           done()
  //         })
  //     })
  // })

  test('a file that outlives its TTL is eventually unpinned and removed from the DB and', () => {
    /* test will go here */
    expect(true).toBe(true)
  })
})
