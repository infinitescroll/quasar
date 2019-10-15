const mongoose = require('mongoose')
const request = require('supertest')
const Web3 = require('web3')
const {
  registerPinWatcher,
  handleListenEvent,
  handleStopListeningEvent,
  handlePinHashEvent
} = require('./')

const { node } = require('../ipfs')
const smartContracts = require('../state')
const {
  demoSmartContractJson1,
  demoSmartContractJson2
} = require('../../mockData')
const accounts = require('../../accounts.json')
const listenerJSON = require('../../build/contracts/Listener.json')
const { SmartContractToPoll, Pin } = require('../db')
const { app } = require('../index')

let web3
let contract
let listenerContract

const listenerUnsubscribe = () =>
  new Promise((resolve, reject) => {
    listenerContract.methods
      .unsubscribeContract(demoSmartContractJson1.address)
      .send({ from: accounts[0] }, err => {
        if (err) reject(err)
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
  contract = new web3.eth.Contract(
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
  smartContracts.clear()
  await SmartContractToPoll.deleteMany({})
  expect(smartContracts.get().length).toBe(0)
})

afterAll(() => {
  web3.currentProvider.connection.close()
})

test(`emitting listen event from listener, then emittting pin event
from pinning contract (without registering pinner) pins file`, async done => {
  const testKey = web3.utils.fromAscii('testKey')
  const dag = { testKey: 'testVal' }
  const hash = await node.dag.put(dag)
  await removeHashIfPinned(hash.toBaseEncodedString())

  const emitListenToContractEvent = () =>
    new Promise(resolve => {
      listenerContract.methods
        .listenToContract(demoSmartContractJson1.address)
        .send({ from: accounts[0] }, () => {
          setTimeout(() => {
            resolve()
          }, 500)
        })
    })

  await listenerUnsubscribe()
  await emitListenToContractEvent()

  contract.methods
    .registerData(testKey, hash.toBaseEncodedString())
    .send({ from: accounts[0] }, () => {
      setTimeout(async () => {
        const pins = await node.pin.ls()
        const match = pins.find(
          item => item.hash === hash.toBaseEncodedString()
        )
        expect(match).toBeDefined()
        done()
      }, 2200)
    })
}, 7500)

test('watcher pins file from registerData function', async done => {
  const testKey = web3.utils.fromAscii('testKey')
  const dag = { testKey: 'testVal' }
  const hash = await node.dag.put(dag)
  await removeHashIfPinned(hash.toBaseEncodedString())

  await listenerUnsubscribe()
  registerPinWatcher(contract)

  contract.methods
    .registerData(testKey, hash.toBaseEncodedString())
    .send({ from: accounts[0] }, () => {
      setTimeout(async () => {
        const pins = await node.pin.ls()
        const match = pins.find(
          item => item.hash === hash.toBaseEncodedString()
        )
        expect(match).toBeDefined()
        done()
      }, 1000)
    })
})

test('firing a listen event adds a new contract to state + unsubscribing removes one', async done => {
  const registerContract = contract =>
    new Promise(resolve => {
      listenerContract.methods
        .listenToContract(contract.address)
        .send({ from: accounts[0] }, () => {
          setTimeout(() => {
            resolve()
          }, 1000)
        })
    })

  await Promise.all([
    await registerContract(demoSmartContractJson1),
    await registerContract(demoSmartContractJson2)
  ])

  const smartContractToPoll = await SmartContractToPoll.findOne({
    address: demoSmartContractJson1.address
  })
  expect(smartContractToPoll.address).toBe(demoSmartContractJson1.address)
  expect(smartContractToPoll.sizeOfPinnedData).toBe(0)
  expect(smartContractToPoll.lastPolledBlock).toBe(0)

  const secondSmartContractToPoll = await SmartContractToPoll.findOne({
    address: demoSmartContractJson2.address
  })
  expect(secondSmartContractToPoll.address).toBe(demoSmartContractJson2.address)
  expect(secondSmartContractToPoll.sizeOfPinnedData).toBe(0)
  expect(secondSmartContractToPoll.lastPolledBlock).toBe(0)

  listenerContract.methods
    .unsubscribeContract(demoSmartContractJson1.address)
    .send({ from: accounts[0] }, () => {
      setTimeout(async () => {
        const smartContractToPoll = await SmartContractToPoll.findOne({
          address: demoSmartContractJson1.address
        })
        const secondSmartContractToPoll = await SmartContractToPoll.findOne({
          address: demoSmartContractJson2.address
        })
        expect(smartContractToPoll).toBe(null)
        expect(secondSmartContractToPoll.address).toBe(
          demoSmartContractJson2.address
        )
        done()
      }, 1000)
    })
})

test('handleListenEvent adds smart contract to database', async done => {
  const eventObj = {
    returnValues: { contractAddress: demoSmartContractJson1.address }
  }

  await handleListenEvent(null, eventObj)
  const smartContractToPoll = await SmartContractToPoll.findOne({
    address: demoSmartContractJson1.address
  })
  expect(smartContractToPoll.address).toBe(demoSmartContractJson1.address)
  expect(smartContractToPoll.sizeOfPinnedData).toBe(0)
  expect(smartContractToPoll.lastPolledBlock).toBe(0)
  done()
})

test('handleStopListenEvent removes smart contract to database', async done => {
  const eventObj = {
    returnValues: { contractAddress: demoSmartContractJson1.address }
  }

  await handleStopListeningEvent(null, eventObj)
  const smartContractToPoll = await SmartContractToPoll.findOne({
    address: demoSmartContractJson1.address
  })
  expect(smartContractToPoll).toBe(null)
  done()
})

test('handleListenEvent throws error with empty params', async done => {
  await expect(handleListenEvent()).rejects.toThrow()
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

  await request(app)
    .post('/api/v0/dag/put')
    .send(dagA)
    .expect(201)
  await request(app)
    .post('/api/v0/dag/put')
    .send(dagB)
    .expect(201)

  await handlePinHashEvent(null, eventObj)

  const removedCid = await Pin.find({ cid: cidA.toBaseEncodedString() }).exec()
  expect(removedCid.length).toBe(0)
  const storedCid = await Pin.find({ cid: cidB.toBaseEncodedString() }).exec()
  expect(storedCid.length).toBe(1)

  done()
})

test('handlePinHashEvent throws error with empty params', async done => {
  await expect(handlePinHashEvent()).rejects.toThrow()
  done()
})

// Uncomment this when timeout in ipfs.dag.get is working. Will need to adjust jest.setTimeout.Timeout past the dag.get timeout time.

// test('handlePinHashEvent throws an error after X seconds if the cid is unavailable on the network', async done => {
//   const invalidEventObj = {
//     returnValues: {
//       cid: 'bafyreigunyjtx4oyopevaygyizasvgwitymlcnlwitlkiszl4krdpofpro'
//     }
//   }

//   try {
//     await handlePinHashEvent(null, invalidEventObj)
//     expect(true).toBe(false)
//     done()
//   } catch (error) {
//     expect(error).toBeDefined()
//     done()
//   }
// })
