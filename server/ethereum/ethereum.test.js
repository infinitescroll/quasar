// const Web3 = require('web3')
// const { registerWatcher } = require('./')
// const ipfsWrapper = require('../ipfs')
// const { demoSmartContractJson } = require('../../mockData')
// const accounts = require('../../accounts.json')

// let contract

// const web3 = new Web3(
//   new Web3.providers.WebsocketProvider('ws://localhost:8545')
// )

// let node

beforeAll(() => {
  // contract = new web3.eth.Contract(
  //   demoSmartContractJson.abi,
  //   demoSmartContractJson.address
  // )
  // const ipfs = ipfsWrapper({
  //   host: process.env.IPFS_NODE_HOST ? process.env.IPFS_NODE_HOST : 'localhost',
  //   port: process.env.IPFS_NODE_PORT ? process.env.IPFS_NODE_PORT : '5001',
  //   protocol: process.env.IPFS_NODE_PROTOCOL
  //     ? process.env.IPFS_NODE_PROTOCOL
  //     : 'http',
  //   headers: null
  // })
  // node = ipfs.node
})

// NOTE - this isn't really testing anything yet, just showing how to fire an event and getting the testing framework working
test('firing an event pins a file', async done => {
  expect(true).toBe(true)
  // const testKey = web3.utils.fromAscii('testKey')
  // const testVal = { dag: 'killinnnnnn it' }
  // const hash = await node.dag.put(testVal)
  done()

  // registerWatcher(contract)
  // contract.methods
  //   .registerData(testKey, hash.toBaseEncodedString())
  //   .send({ from: accounts[0] }, (err, res) => {
  //     setTimeout(() => {
  //       done()
  //     }, 2000)
  //   })
})
