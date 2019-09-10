const supertest = require('supertest')
const app = require('../../../server')
const { getSmartContracts, initSmartContracts } = require('../../state')
const request = supertest(app)

const demoSmartContract = {
  smartContract: 'asdfasdfjahkj',
  network: 'mainnet',
  abi: 'whatever'
}

test('POST well-formed smart contract', done => {
  request
    .post('/api/v0/contracts')
    .send(demoSmartContract)
    .expect(200)

  done()
})

test('Save well-formed smart contract', done => {
  const postContract = async () => {
    initSmartContracts()
    await request.post('/api/v0/contracts').send(demoSmartContract)
    expect(getSmartContracts()).toMatchObject([demoSmartContract])
    done()
  }
  postContract()
})

test('POST malformed smart contract', done => {
  request
    .post('/api/v0/contracts')
    .send({ wrong: 'structure' })
    .expect(400)
    .expect(
      'Error: smartContract is missing or invalid. Error: network is missing or invalid. Error: abi is missing or invalid.'
    )

  done()
})
