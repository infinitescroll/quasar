const supertest = require('supertest')
const app = require('../../../server')
const { getSmartContracts, initSmartContracts } = require('../../state')
const { demoSmartContractJson } = require('../../../mockData')
const request = supertest(app)

test('POST well-formed smart contract', done => {
  request
    .post('/api/v0/contracts')
    .send(demoSmartContractJson)
    .expect(200)

  done()
})

test('Save well-formed smart contract', async done => {
  initSmartContracts()
  await request.post('/api/v0/contracts').send(demoSmartContractJson)
  expect(getSmartContracts()).toMatchObject([demoSmartContractJson])
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
