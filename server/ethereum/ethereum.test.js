const Web3 = require('web3')
const {
  registerListenWatcher,
  registerPinWatcher,
  registerStopListeningWatcher,
  handleListenEvent,
  handlePinHashEvent,
  getContract
} = require('./')

const ipfs = require('../ipfs')
const smartContracts = require('../state')
const {
  demoSmartContractJson1,
  demoSmartContractJson2
} = require('../../mockData')
const accounts = require('../../accounts.json')
const listenerJSON = require('../../build/contracts/Listener.json')

let web3
let contract
let listenerContract
let node
let listenerUnsubscribe

const removeHashIfPinned = async cid => {
  const pins = await node.pin.ls()
  const match = pins.find(item => item.hash === cid)
  if (match) return node.pin.rm(match.hash)
  return
}

beforeAll(() => {
  web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'))
  contract = new web3.eth.Contract(
    demoSmartContractJson1.abi,
    demoSmartContractJson1.address
  )

  listenerContract = new web3.eth.Contract(
    listenerJSON.abi,
    listenerJSON.networks['123'].address
  )

  registerStopListeningWatcher(listenerContract)
  registerListenWatcher(listenerContract)

  node = ipfs.node

  listenerUnsubscribe = () =>
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
})

beforeEach(async done => {
  smartContracts.clear()
  done()
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

  expect(smartContracts.get()[0].address).toBe(demoSmartContractJson1.address)
  expect(smartContracts.get()[0]).toHaveProperty('listener')

  expect(smartContracts.get()[1].address).toBe(demoSmartContractJson2.address)
  expect(smartContracts.get()[1]).toHaveProperty('listener')

  listenerContract.methods
    .unsubscribeContract(demoSmartContractJson1.address)
    .send({ from: accounts[0] }, () => {
      setTimeout(() => {
        expect(smartContracts.get().length).toBe(1)
        expect(smartContracts.get()[0].address).toBe(
          demoSmartContractJson2.address
        )
        expect(smartContracts.get()[0]).toHaveProperty('listener')
        done()
      }, 1000)
    })
})

test('handleListenEvent adds smart contract to state', async done => {
  const eventObj = {
    returnValues: { contractAddress: demoSmartContractJson1.address }
  }

  await handleListenEvent(null, eventObj)
  expect(smartContracts.get()[0].address).toBe(demoSmartContractJson1.address)
  expect(smartContracts.get()[0]).toHaveProperty('listener')
  done()
})

test('handleListenEvent throws error with empty params', async done => {
  await expect(handleListenEvent()).rejects.toThrow()
  done()
})

test('handlePinHashEvent pins file of cid it was passed', async done => {
  const dag = { secondTestKey: 'secondTestVal' }
  const cid = await node.dag.put(dag)

  const eventObj = {
    returnValues: {
      cid: cid.toBaseEncodedString()
    }
  }

  const res = await handlePinHashEvent(null, eventObj)

  expect(res[0].hash).toBe(cid.toBaseEncodedString())
  done()
})

test('handlePinHashEvent throws error with empty params', async done => {
  await expect(handlePinHashEvent()).rejects.toThrow()
  done()
})

test('getContract returns a contract', async done => {
  const contract = getContract(
    demoSmartContractJson1,
    demoSmartContractJson1.address
  )
  expect(contract._address).toBe(demoSmartContractJson1.address)
  done()
})

// this test must go last bc it mutates demoSmartContractJson1!!
test('getContract throws when an invalid contract is passed', async done => {
  demoSmartContractJson1.address = '0x7505462c30102eBCDA555446c3807362AeFEfc8r'
  const badCall = () => {
    return getContract(
      demoSmartContractJson1,
      '0x7505462c30102eBCDA555446c3807362AeFEfc8r'
    )
  }

  expect(badCall).toThrow()
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
