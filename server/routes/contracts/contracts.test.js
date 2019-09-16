const supertest = require('supertest')
const app = require('../../../server')
const { getSmartContracts, initSmartContracts } = require('../../state')
const request = supertest(app)

const demoSmartContract = {
  address: 'asdfasdfjahkj',
  network: 'mainnet',
  abi: { name: 'contractName' }
}

test('posting well-formed smart contract returns 200', done => {
  request
    .post('/api/v0/contracts')
    .send(demoSmartContract)
    .expect(200)

  done()
})

test('Saving well-formed smart contract works', async done => {
  initSmartContracts()
  await request.post('/api/v0/contracts').send(demoSmartContract)
  expect(getSmartContracts()).toMatchObject([demoSmartContract])
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
