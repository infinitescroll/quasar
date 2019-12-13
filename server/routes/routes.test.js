const request = require('supertest')
const mongoose = require('mongoose')
const FormData = require('form-data')
const axios = require('axios')
const fs = require('fs')

const { app } = require('../index')
const { node } = require('../ipfs')
const { Pin, StorageContract } = require('../db')

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

describe('routes', () => {
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
    }, 10000)

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
  })

  describe('contract endpoints', () => {
    test('POST contract should store contract in database', async done => {
      const body = {
        contractAddress: '0xfffd933a0bc612844eaf0c6fe3e5b8e9b6c1d19c'
      }

      await request(app)
        .post('/api/v0/storageContracts')
        .send(body)
        .expect(201)

      const doc = await StorageContract.findOne({
        address: body.contractAddress
      })

      expect(doc.address).toBe(body.contractAddress)

      done()
    })

    test('POST contract should not store duplicate contracts in database', async done => {
      const body = {
        contractAddress: '0xaaad933a0bc612844eaf0c6fe3e5b8e9b6c1d19c'
      }

      await request(app)
        .post('/api/v0/storageContracts')
        .send(body)
        .expect(201)

      let docs = await StorageContract.find({
        address: body.contractAddress
      })

      expect(docs.length).toBe(1)

      await request(app)
        .post('/api/v0/storageContracts')
        .send(body)
        .expect(200)

      docs = await StorageContract.find({
        address: body.contractAddress
      })

      expect(docs.length).toBe(1)

      done()
    })

    test('POST contract with invalid key should respond with an error', async done => {
      const body = {
        invalidKey: '0xfffd933a0bc612844eaf0c6fe3e5b8e9b6c1d19c'
      }

      await request(app)
        .post('/api/v0/storageContracts')
        .send(body)
        .expect(400)

      done()
    })

    test('GET contracts returns list of contracts', async done => {
      const body = {
        contractAddress: '0xfffd933a0bc612844eaf0c6fe3e5b8e9b6c1d19f'
      }

      await request(app)
        .post('/api/v0/storageContracts')
        .send(body)
        .expect(201)

      await request(app)
        .get('/api/v0/storageContracts')
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

  describe('provider endpoints', () => {
    test('GET /ipfs-provider should return information about the ipfs provider quasar is connected to', () => {
      return request(app)
        .get('/api/v0/ipfs-provider')
        .expect(200)
        .expect(res => {
          // res.json() dne on supertest response obj
          const jsonResponse = JSON.parse(res.text)
          expect(jsonResponse.baseUrl).toBeDefined()
          expect(jsonResponse.dagGetUrl).toBeDefined()
          expect(jsonResponse.dagPutUrl).toBeDefined()
          expect(Object.keys(jsonResponse).length).toBe(3)
        })
    })
  })

  describe('files endpoints', () => {
    test(`/add endpoint should return hash and success status`, done => {
      const server = app.listen('9096', async () => {
        const form = new FormData()
        // using one readable stream in 2 places causes requests to hang
        const readStream = await fs.createReadStream('./mockData/testFile.md')
        form.append('entry', readStream)

        const res = await axios.post('http://localhost:9096/api/v0/add', form, {
          headers: form.getHeaders()
        })

        const isSuccessStatus = result => {
          if (result.status === 201 || result.status === 200) return true
          return false
        }

        const readStream2 = await fs.createReadStream('./mockData/testFile.md')
        const [{ hash }] = await node.add(readStream2)

        expect(res.data).toBe(hash)
        expect(isSuccessStatus(res)).toBe(true)
        server.close(done)
      })
    })

    test(`/cat endpoint should return file`, done => {
      const server = app.listen('9097', async () => {
        const form = new FormData()
        // using one readable stream in 2 places causes requests to hang
        const readStream = await fs.createReadStream('./mockData/testFile.md')
        form.append('entry', readStream)

        // add the file to our node so we can cat it for the test
        await axios.post('http://localhost:9097/api/v0/add', form, {
          headers: form.getHeaders()
        })

        const readStream2 = await fs.createReadStream('./mockData/testFile.md')
        const [{ hash }] = await node.add(readStream2)

        const catRes = await axios.get(
          `http://localhost:9097/api/v0/cat?arg=${hash}`
        )
        expect(catRes.data).toBe('This file is used to test the /add endpoint.')
        expect(catRes.status).toBe(200)
        server.close(done)
      })
    })
  })
})

/*
  This route tested in the integration tests.
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
