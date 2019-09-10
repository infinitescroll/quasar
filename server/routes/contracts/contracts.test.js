const supertest = require('supertest')
const app = require('../../../server')
const { getSmartContracts } = require('../../state')
const request = supertest(app)

const demoSmartContract = {
  smartContract: 'asdfasdfjahkj',
  network: 'mainnet',
  abi: 'whatever'
}

test('POST well-formed smart contract', async () => {
  await request
    .post('/api/v0/contracts')
    .send(demoSmartContract)
    .expect(200)

  expect(getSmartContracts()).toMatchObject([demoSmartContract])
})

test('POST malformed smart contract', () => {
  request
    .post('/api/v0/contracts')
    .send({ wrong: 'structure' })
    .expect(400)
})
