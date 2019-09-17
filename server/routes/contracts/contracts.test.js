const request = require('supertest')
const app = require('../../../server')
const { getSmartContracts, initSmartContracts } = require('../../state')
const { demoSmartContractJson } = require('../../../mockData')

test('POST well-formed smart contract', () => {
  return request(app)
    .post('/api/v0/contracts')
    .send(demoSmartContractJson)
    .expect(200)
})

test('Save well-formed smart contract', async done => {
  initSmartContracts()
  await request(app)
    .post('/api/v0/contracts')
    .send(demoSmartContractJson)
  expect(getSmartContracts()).toMatchObject([demoSmartContractJson])
  done()
})

test('POST malformed smart contract', done => {
  request(app)
    .post('/api/v0/contracts')
    .send({ wrong: 'structure' })
    .expect(400)
    .expect(
      'the following fields are missing or invalid: address, network, abi'
    )
  done()
})
