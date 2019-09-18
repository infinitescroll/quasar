const request = require('supertest')
const app = require('../../../server')
const smartContracts = require('../../state')
const {
  demoSmartContractJson1,
  demoSmartContractJson2
} = require('../../../mockData')

beforeEach(() => {
  smartContracts.clear()
})

test('posting well-formed smart contract returns 200', async done => {
  await request(app)
    .post('/api/v0/contracts')
    .send(demoSmartContractJson1)
    .expect(200)
  done()
})

test('Saving well-formed smart contract works', async done => {
  await request(app)
    .post('/api/v0/contracts')
    .send(demoSmartContractJson1)
  await request(app)
    .post('/api/v0/contracts')
    .send(demoSmartContractJson2)
  expect(smartContracts.get()).toMatchObject([
    demoSmartContractJson1,
    demoSmartContractJson2
  ])
  done()
})

test('posting malformed smart contract returns 400 + error', async done => {
  await request(app)
    .post('/api/v0/contracts')
    .send({ wrong: 'structure' })
    .expect(400)
    .expect('the following fields are missing or invalid: address, abi')
  done()
})
