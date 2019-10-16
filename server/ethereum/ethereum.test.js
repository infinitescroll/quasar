const mongoose = require('mongoose')
// const request = require('supertest')
const {
  handleListenEvent,
  handleStopListeningEvent,
  handlePinHashEvent
} = require('./')

const { node } = require('../ipfs')
const { demoSmartContractJson1 } = require('../../mockData')
const { SmartContractToPoll, Pin } = require('../db')

beforeAll(async done => {
  await mongoose.connect(process.env.DB_URL || 'mongodb://localhost/test', {
    useNewUrlParser: true
  })
  mongoose.connection.db.dropDatabase()
  done()
})

beforeEach(async () => {
  await SmartContractToPoll.deleteMany({})
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
    await SmartContractToPoll.create({
      address: demoSmartContractJson1.address,
      lastPolledBlock: 0,
      sizeOfPinnedData: 0
    })

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
