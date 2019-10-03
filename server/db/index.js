const mongoose = require('mongoose')
const web3 = require('web3')
const isIPFS = require('is-ipfs')
const ipfs = require('../ipfs/')

const pinSchema = new mongoose.Schema(
  {
    size: { type: Number, required: true },
    cid: {
      type: String,
      required: true,
      validate: cid => isIPFS.cid(cid)
    },
    time: { type: Date, required: true }
  },
  { strict: 'throw' }
)

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
