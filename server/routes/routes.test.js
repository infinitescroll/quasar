const supertest = require('supertest')
const { app } = require('../../server')
const request = supertest(app)

test('POST dag', done => {
  request
    .post('/api/v0/dag/put')
    .send({
      dag: { test: '123' },
      smartContract: '0xfffd933a0bc612844eaf0c6fe3e5b8e9b6c1d19c'
    })
    .expect(201, done)
})

test('POST dag without valid dag should throw 400', done => {
  request
    .post('/api/v0/dag/put')
    .send({
      smartContract: '0xfffd933a0bc612844eaf0c6fe3e5b8e9b6c1d19c'
    })
    .expect(400, done)
})

test('POST dag with invalid contract address should throw 400', done => {
  request
    .post('/api/v0/dag/put')
    .send({
      dag: { test: '123' },
      smartContract: '0xfffd933a0bc612844eaf0c6fe3e5b8e9b6'
    })
    .expect(400, done)
})

test('POST file without file should throw 400', done => {
  request
    .post('/api/v0/add')
    .send({
      smartContract: '0xfffd933a0bc612844eaf0c6fe3e5b8e9b6'
    })
    .expect(400, done)
})
