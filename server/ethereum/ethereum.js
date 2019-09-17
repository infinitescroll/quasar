const Web3 = require('web3')
const storageJSON = require('../../build/contracts/Storage.json')
const accounts = require('../../accounts.json')
const ipfsWrapper = require('../ipfs')
const node = ipfsWrapper({
  host: process.env.IPFS_NODE_HOST ? process.env.IPFS_NODE_HOST : 'localhost',
  port: process.env.IPFS_NODE_PORT ? process.env.IPFS_NODE_PORT : '5001',
  protocol: process.env.IPFS_NODE_PROTOCOL
    ? process.env.IPFS_NODE_PROTOCOL
    : 'http',
  headers: null
})

const web3 = new Web3(
  new Web3.providers.WebsocketProvider('ws://localhost:8545')
)

const getContract = smartContractObj => {
  return new web3.eth.Contract(smartContractObj.abi, smartContractObj.address)
}

const registerWatcher = contract => {
  return contract.events.PinHash({}, async (err, event) => {
    if (err) console.error('Error subscribing: ', err)

    node
      .getAndPin(event.returnValues.cid)
      .then(res => {
        if (!res[0]) console.error(res)
        else console.log('Pinned', res[0].hash)
      })
      .catch(error => {
        console.error('Error pinning: ', error)
      })
  })
}

// TODO: Move to a test file
const testKey = web3.utils.fromAscii('testKey')
const testWatching = () => {
  const contract = new web3.eth.Contract(
    storageJSON.abi,
    storageJSON.networks['123'].address
  )

  registerWatcher(contract)

  contract.methods
    .registerData(
      testKey,
      'bafyreiextvfmingotbut6j5tkszqhrqkm5ii5r3alh6g3xt2uuzmx7vrpi'
    )
    .send({ from: accounts[0] })
}

module.exports = { registerWatcher, testWatching, getContract }
