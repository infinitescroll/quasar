const supertest = require('supertest')
const { app } = require('../../../server')
const { abi, networks } = require('../../../build/contracts/Storage.json')
const { getSmartContracts, initSmartContracts } = require('../../state')
const request = supertest(app)

const demoSmartContract = {
  address: networks['123'].address,
  network: 'mainnet',
  abi
}

test('POST well-formed smart contract', done => {
  request
    .post('/api/v0/contracts')
    .send(demoSmartContract)
    .expect(200)

  done()
})

test('Save well-formed smart contract', async done => {
  initSmartContracts()
  await request.post('/api/v0/contracts').send(demoSmartContract)
  expect(getSmartContracts()).toMatchObject([demoSmartContract])
  done()
})

test('POST malformed smart contract', done => {
  request
    .post('/api/v0/contracts')
    .send({ wrong: 'structure' })
    .expect(400)
    .expect(
      '"the following fields are missing or invalid: smartContract, network, abi"'
    )

  done()
})
