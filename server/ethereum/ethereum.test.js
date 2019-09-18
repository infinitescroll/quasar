const Web3 = require('web3')
const { registerListenWatcher, registerPinWatcher } = require('./')
const ipfsWrapper = require('../ipfs')
const { demoSmartContractJson1 } = require('../../mockData')
const accounts = require('../../accounts.json')
const listenerJSON = require('../../build/contracts/Listener.json')

let web3
let contract
let listenerContract
let node

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

// NOTE - this isn't really testing anything yet, just showing how to fire an event and getting the testing framework working
test('firing a pin event pins a file', async done => {
  const testKey = web3.utils.fromAscii('testKey')
  const testVal = { dag: 'killinnnnnn it' }
  const hash = await node.dag.put(testVal)

  registerPinWatcher(contract)
  contract.methods
    .registerData(testKey, hash.toBaseEncodedString())
    .send({ from: accounts[0] }, () => {
      setTimeout(() => {
        done()
      }, 2000)
    })
})

test('firing a listen event listens to a new contract', async done => {
  registerListenWatcher(listenerContract)
  listenerContract.methods
    .listenToContract(demoSmartContractJson1.address)
    .send({ from: accounts[0] }, () => {
      setTimeout(() => {
        done()
      }, 2000)
    })
})
