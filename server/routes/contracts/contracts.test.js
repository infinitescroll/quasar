const app = require('../../../server')
const supertest = require('supertest')
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
})

test('POST malformed smart contract', async () => {
  await request
    .post('/api/v0/contracts')
    .send({ wrong: 'structure' })
    .expect(400)
})
