const Web3 = require('web3')
const { abi } = require('../build/contracts/Storage.json')
const accounts = require('../accounts.json')

const createEvent = () =>
  new Promise((resolve, reject) => {
    const web3 = new Web3(
      new Web3.providers.WebsocketProvider('ws://localhost:8545')
    )

    const testKey = web3.utils.fromAscii('testKey')

    const contract = new web3.eth.Contract(
      abi,
      '0xB895BB22cCa9DC1689d1D04aE294F59Fa92cF51C'
    )

    contract.methods
      .registerData(testKey, 'qm123')
      .send({ from: accounts[0] }, (error, res) => {
        if (error) reject(error)
        resolve(res)
      })
  })

const start = async () => {
  try {
    const res = await createEvent()
    console.log('tx successfully completed: ', res)
  } catch (error) {
    console.log('tx unsuccessfull, error: ', error)
  }
  process.exit(0)
}

start()
