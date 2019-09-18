const Web3 = require('web3')
const { getContract, handlePinHashEvent, registerWatcher } = require('./')
const ipfsWrapper = require('../ipfs')
const { demoSmartContractJson1 } = require('../../mockData')
const accounts = require('../../accounts.json')

let web3
let contract
let node
const dag = { testKey: 'testVal' }

beforeAll(() => {
  web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'))
  contract = new web3.eth.Contract(
    demoSmartContractJson1.abi,
    demoSmartContractJson1.address
  )
  const ipfs = ipfsWrapper({
    host: process.env.IPFS_NODE_HOST ? process.env.IPFS_NODE_HOST : 'localhost',
    port: '5002',
    protocol: process.env.IPFS_NODE_PROTOCOL
      ? process.env.IPFS_NODE_PROTOCOL
      : 'http',
    headers: null
  })
  node = ipfs.node
})

afterAll(() => {
  web3.currentProvider.connection.close()
})

test('watcher pins file from registerData function', async done => {
  const testKey = web3.utils.fromAscii('testKey')
  const hash = await node.dag.put(dag)

  registerWatcher(contract)
  contract.methods
    .registerData(testKey, hash.toBaseEncodedString())
    .send({ from: accounts[0] }, () => {
      setTimeout(async () => {
        const pins = await node.pin.ls()
        const match = pins.find(item => {
          return item.hash === hash.toBaseEncodedString()
        })
        expect(match).toBeDefined()
        done()
      }, 2000)
    })
})

test('handlePinHashEvent pins file of cid it was passed', async done => {
  dag.testKey = 'handlePinHashEventTestVal'
  const hash = await node.dag.put(dag)
  const eventObj = {
    returnValues: {
      cid: hash.toBaseEncodedString()
    }
  }

  const res = await handlePinHashEvent(null, eventObj)
  expect(res[0].hash).toBe(hash.toBaseEncodedString())
  done()
})

test('handlePinHashEvent throws error with empty params', async done => {
  try {
    await handlePinHashEvent()
    expect(true).toBe(false)
    done()
  } catch (error) {
    expect(error).toBeDefined()
    done()
  }
})

test('getContract returns a contract', async done => {
  const contract = getContract(
    demoSmartContractJson1,
    demoSmartContractJson1.address
  )
  expect(contract._address).toBe(demoSmartContractJson1.address)
  done()
})

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

// test('handlePinHashEvent throws and error with an invalid cid', async done => {
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
