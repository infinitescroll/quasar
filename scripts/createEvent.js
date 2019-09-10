const Web3 = require('web3');
const abi = require('../build/SimpleStorage.json');
const accounts = require('../accounts.json');

const web3 = new Web3(
  new Web3.providers.WebsocketProvider('ws://localhost:8545')
);

const testKey = web3.utils.fromAscii('testKey');

const contract = new web3.eth.Contract([abi]);

contract.methods
  .registeredData(testKey, 'qm123')
  .send({ from: accounts[0] }, (error, res) => {
    console.log('error', error);
    console.log('res', res);
  });
