const supertest = require('supertest')
const app = require('../../../server')
const { getSmartContracts, initSmartContracts } = require('../../state')
const { demoSmartContractJson } = require('../../../mockData')
const request = supertest(app)

test('posting well-formed smart contract returns 200', done => {
  request
    .post('/api/v0/contracts')
    .send(demoSmartContractJson)
    .expect(200)

  done()
})

test('Saving well-formed smart contract works', async done => {
  initSmartContracts()
  await request.post('/api/v0/contracts').send(demoSmartContractJson)
  expect(getSmartContracts()).toMatchObject([demoSmartContractJson])
  done()
})

test('posting malformed smart contract returns 400 + error', done => {
  request
    .post('/api/v0/contracts')
    .send({ wrong: 'structure' })
    .expect(400)
    .expect(
      '"the following fields are missing or invalid: smartContract, network, abi"'
    )

  done()
})
