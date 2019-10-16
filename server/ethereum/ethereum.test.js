const mongoose = require('mongoose')
// const request = require('supertest')
const Web3 = require('web3')
const {
  // registerPinWatcher,
  handleListenEvent,
  handleStopListeningEvent,
  handlePinHashEvent
} = require('./')

const { node } = require('../ipfs')
const {
  demoSmartContractJson1,
  demoSmartContractJson2
} = require('../../mockData')
const accounts = require('../../accounts.json')
const listenerJSON = require('../../build/contracts/Listener.json')
const { SmartContractToPoll, Pin } = require('../db')
// const { app } = require('../index')

let web3
let contract
let listenerContract

// const listenerUnsubscribe = contractAddress =>
//   new Promise((resolve, reject) => {
//     listenerContract.methods
//       .unsubscribeContract(contractAddress)
//       .send({ from: accounts[0] }, err => {
//         if (err) reject(err)
//         setTimeout(() => {
//           resolve()
//         }, 1000)
//       })
//   })

const emitListenToContractEvent = contractAddress =>
  new Promise(resolve => {
    listenerContract.methods
      .listenToContract(contractAddress)
      .send({ from: accounts[0] }, () => {
        setTimeout(() => {
          resolve()
        }, 500)
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
  await SmartContractToPoll.deleteMany({})
})

afterAll(() => {
  web3.currentProvider.connection.close()
})

describe('unit tests', () => {
  test('registerPinWatcher returns an instance of the scheduler', () => {})

  test('registerPinWatcher polls database and updates last polled block on each contract', async done => {
    /* begin tests here */
    expect(true).toBe(true)
    done()
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

  test('handleStopListenEvent removes smart contract from database', async done => {
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

    await handlePinHashEvent(null, eventObj)

    const removedCid = await Pin.find({
      cid: cidA.toBaseEncodedString()
    }).exec()
    expect(removedCid.length).toBe(0)
    const storedCid = await Pin.find({ cid: cidB.toBaseEncodedString() }).exec()
    expect(storedCid.length).toBe(1)
    done()
  })

  test('handlePinHashEvent throws error with empty params', async done => {
    await expect(handlePinHashEvent()).rejects.toThrow()
    done()
  })
})

describe('integration tests', () => {
  // test('firing listen event adds contract to db, unsubscribing removes', async done => {
  //   const registerContract = contract =>
  //     new Promise(resolve => {
  //       listenerContract.methods
  //         .listenToContract(contract.address)
  //         .send({ from: accounts[0] }, () => {
  //           setTimeout(() => {
  //             resolve()
  //           }, 1000)
  //         })
  //     })
  //   await Promise.all([
  //     await registerContract(demoSmartContractJson1),
  //     await registerContract(demoSmartContractJson2)
  //   ])
  //   const smartContractToPoll = await SmartContractToPoll.findOne({
  //     address: demoSmartContractJson1.address
  //   })
  //   expect(smartContractToPoll.address).toBe(demoSmartContractJson1.address)
  //   expect(smartContractToPoll.sizeOfPinnedData).toBe(0)
  //   expect(smartContractToPoll.lastPolledBlock).toBe(0)
  //   const secondSmartContractToPoll = await SmartContractToPoll.findOne({
  //     address: demoSmartContractJson2.address
  //   })
  //   expect(secondSmartContractToPoll.address).toBe(
  //     demoSmartContractJson2.address
  //   )
  //   expect(secondSmartContractToPoll.sizeOfPinnedData).toBe(0)
  //   expect(secondSmartContractToPoll.lastPolledBlock).toBe(0)
  //   listenerContract.methods
  //     .unsubscribeContract(demoSmartContractJson1.address)
  //     .send({ from: accounts[0] }, () => {
  //       setTimeout(async () => {
  //         const smartContractToPoll = await SmartContractToPoll.findOne({
  //           address: demoSmartContractJson1.address
  //         })
  //         const secondSmartContractToPoll = await SmartContractToPoll.findOne({
  //           address: demoSmartContractJson2.address
  //         })
  //         expect(smartContractToPoll).toBe(null)
  //         expect(secondSmartContractToPoll.address).toBe(
  //           demoSmartContractJson2.address
  //         )
  //         done()
  //       }, 1000)
  //     })
  // })
  // test(`emitting listen event from listener, then emittting pin event
  // from pinning contract (without registering pinner) keeps file pinned`, async done => {
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
  // test('a file that outlives its TTL is eventually unpinned and removed from the DB and', () => {
  //   /* test will go here */
  //   expect(true).toBe(true)
  // })
})
