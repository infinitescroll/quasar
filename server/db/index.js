const mongoose = require('mongoose')
const ipfs = require('../ipfs/')

const pinSchema = new mongoose.Schema({
  size: Number,
  cid: String,
  smartContract: String,
  time: Date
})

const Pin = new mongoose.model('Pin', pinSchema)

const findandRemoveOldPins = async () => {
  const ttl = process.env.TTL || 14
  let cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - ttl)

  const removeOldPins = pins => {
    pins.map(async pin => {
      await ipfs.node.pin.rm(pin.cid)
    })
  }

  const oldPins = await Pin.find({ time: { $lt: cutoffDate } }).exec()
  removeOldPins(oldPins)

  await Pin.deleteMany({ time: { $lt: cutoffDate } }).exec()
}

module.exports = {
  Pin,
  findandRemoveOldPins
}
