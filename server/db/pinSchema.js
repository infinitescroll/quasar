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
    smartContract: {
      type: String,
      required: true,
      validate: smartContract => web3.utils.isAddress(smartContract)
    },
    time: { type: Date, required: true }
  },
  { strict: 'throw' }
)

class PinClass {
  static async findandRemoveOldPins() {
    const ttl = process.env.TTL || 14
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - ttl)

    const oldPins = await this.find({ time: { $lt: cutoffDate } }).exec()
    await Promise.all(oldPins.map(async pin => await ipfs.node.pin.rm(pin.cid)))

    await this.deleteMany({ time: { $lt: cutoffDate } }).exec()
  }
}

pinSchema.loadClass(PinClass)
module.exports = new mongoose.model('Pin', pinSchema)
