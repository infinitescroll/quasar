const mongoose = require('mongoose')
const Pin = require('./pinSchema')
const ipfs = require('../ipfs')
const ttl = process.env.TTL || 14
const oldDate = new Date()
oldDate.setDate(oldDate.getDate() - ttl - 1)

let cid1, cid2
beforeAll(async done => {
  await mongoose.connect(process.env.DB_URL || 'mongodb://localhost/test', {
    useNewUrlParser: true
  })
  mongoose.connection.db.dropDatabase()

  cid1 = await ipfs.node.dag.put({ test: 'data1' })
  cid1 = cid1.toBaseEncodedString()
  await ipfs.node.pin.add(cid1)
  cid2 = await ipfs.node.dag.put({ test: 'data2' })
  cid2 = cid2.toBaseEncodedString()
  await ipfs.node.pin.add(cid2)

  await Pin.create({
    size: 2000,
    cid: cid1,
    time: new Date()
  })

  await Pin.create({
    size: 2000,
    cid: cid2,
    time: new Date()
  })

  await Pin.create({
    size: 2000,
    cid: cid1,
    time: oldDate
  })

  await Pin.create({
    size: 2000,
    cid: cid2,
    time: oldDate
  })

  done()
})

test('can add and retrieve well-formed pins from db', async done => {
  const pins1 = await Pin.find({ cid: cid1 }).exec()
  expect(pins1.length > 0).toBe(true)

  const pins2 = await Pin.find({ cid: cid2 }).exec()
  expect(pins2.length > 0).toBe(true)
  done()
})

test('can add + remove old pins from db', async done => {
  const cuttoff = new Date()
  cuttoff.setDate(cuttoff.getDate() - ttl)

  const outdatedPins = await Pin.find({ time: { $lt: cuttoff } }).exec()
  expect(outdatedPins.length).toBe(2)

  await Pin.findandRemoveOldPins()
  const oldPins = await Pin.find({ time: { $lt: cuttoff } })
  expect(oldPins.length).toBe(0)

  done()
})

test('adding malformed pin object throws', async done => {
  const badCid = new Pin({
    cid: 89,
    time: new Date(),
    size: 2000
  })

  const missingFields = new Pin({
    time: new Date()
  })

  const badCid2 = new Pin({
    cid: 'fake cid'
  })

  await expect(badCid.save()).rejects.toThrow()
  await expect(badCid2.save()).rejects.toThrow()
  await expect(missingFields.save()).rejects.toThrow()
  expect(() => {
    new Pin({
      bad: 'field',
      cid: cid1,
      time: new Date(),
      size: 2000
    })
  }).toThrow()

  done()
})
