const Web3 = require('web3')
const ipfs = require('./ipfs')

const web3 = new Web3(
  new Web3.providers.WebsocketProvider('ws://localhost:8545')
)

const registerWatcher = contract => {
  contract.events.Registered({}, (err, event) => {
    if (err) console.error('Error subscribing: ', err)

    ipfs
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
const testAddress = ''
const testKey = web3.utils.fromAscii('testKey')
const testAbi = []

const testWatching = () => {
  const contract = new web3.eth.Contract(testAbi, testAddress)
  registerWatcher(contract)

  contract.methods
    .registerData(
      testKey,
      'bafyreidyficfemkwhbtuitk5ylymbychz7chvl4cpozn2brwyntxxnflym'
    )
    .send({ from: '0xa3BAC6292281000FD29eF747be28E31093DaC61c' })
}

module.exports = { registerWatcher, testWatching }
