const request = require('supertest')
const mongoose = require('mongoose')
// const FormData = require('form-data')
// const fs = require('fs')
const { app } = require('../index')
const { node } = require('../ipfs')
const { Pin, SmartContractToPoll } = require('../db')

const removeHashIfPinned = async cid => {
  const pins = await node.pin.ls()
  const match = pins.find(item => item.hash === cid)
  if (match) return node.pin.rm(match.hash)
  return
}

const createHashFromDag = async dag => {
  const hash = await node.dag.put(dag)
  await removeHashIfPinned(hash.toBaseEncodedString())
  return hash.toBaseEncodedString()
}

beforeAll(async done => {
  await mongoose.connect(process.env.DB_URL || 'mongodb://localhost/test', {
    useNewUrlParser: true
  })
  mongoose.connection.db.dropDatabase()
  done()
})

describe('dag endpoints', () => {
  test('POST dag should return a 201 when a dag is passed', () => {
    return request(app)
      .post('/api/v0/dag/put')
      .send({ test: '123' })
      .expect(201)
  })

  test('POST dag should optimistically pin the dag passed', async done => {
    const dag = { test: '456' }
    const hash = await createHashFromDag(dag)
    await request(app)
      .post('/api/v0/dag/put')
      .send(dag)
      .expect(201)
      .expect(res => expect(res.text).toEqual(hash))

    const pins = await node.pin.ls()
    const match = pins.find(item => item.hash === hash)
    expect(match).toBeDefined()
    done()
  })

  test('POST dag should store pin in database for garbage collection', async done => {
    const dag = { test: '789' }
    const hash = await createHashFromDag(dag)
    await request(app)
      .post('/api/v0/dag/put')
      .send(dag)
      .expect(201)
      .expect(res => expect(res.text).toEqual(hash))

    const pin = await Pin.findOne({ cid: hash })
    expect(pin).toBeTruthy()
    expect(pin.size).toBeGreaterThan(0)
    done()
  })

  test('POST contract should store contract in database', async done => {
    const body = {
      contractAddress: '0xfffd933a0bc612844eaf0c6fe3e5b8e9b6c1d19c'
    }

    await request(app)
      .post('/api/v0/contracts')
      .send(body)
      .expect(201)

    const doc = await SmartContractToPoll.findOne({
      address: body.contractAddress
    })

    expect(doc.address).toBe(body.contractAddress)

    done()
  })

  test('POST contract with invalid key should respond with an error', async done => {
    const body = {
      invalidKey: '0xfffd933a0bc612844eaf0c6fe3e5b8e9b6c1d19c'
    }

    await request(app)
      .post('/api/v0/contracts')
      .send(body)
      .expect(400)

    done()
  })

  test('GET contracts returns list of contracts', async done => {
    const body = {
      contractAddress: '0xfffd933a0bc612844eaf0c6fe3e5b8e9b6c1d19f'
    }

    await request(app)
      .post('/api/v0/contracts')
      .send(body)
      .expect(201)

    await request(app)
      .get('/api/v0/contracts')
      .send()
      .expect(200)
      .expect(res => expect(res.body.length).toBeGreaterThan(0))
      .expect(res =>
        expect(res.body[0]).toEqual(
          expect.objectContaining({
            __v: expect.any(Number),
            _id: expect.any(String),
            address: expect.any(String),
            lastPolledBlock: expect.any(Number),
            sizeOfPinnedData: expect.any(Number)
          })
        )
      )

    done()
  })
})

/*
  This test is commented out because 2 things need to be fixed:

  1. https://github.com/visionmedia/superagent/issues/1520
  - sending multipart/form-data via supertest is not working with multer/busboy lib

  2. https://github.com/trufflesuite/ganache-cli/issues/683
  - using any fs module with ganache-cli && jest blows out ganache call stack

  The post endpoint is working, verified by the scripts/sendFile.js
*/
// test('POST file', done => {
//   const form = new FormData()
//   form.append('entry', fs.createReadStream('./readme.md'))
//   request(app)
//     .post('/api/v0/files/add')
//     .type('form')
//     .attach('entry', form, 'readme.md')
//     .set(form.getHeaders())
//     .expect(201, done)
// })
