const mongoose = require('mongoose')
const isIPFS = require('is-ipfs')
const ipfs = require('../ipfs/')
const { log } = require('../constants')

const pinSchema = new mongoose.Schema(
  {
    size: { type: Number, required: true },
    cid: {
      type: String,
      required: true,
      validate: cid => isIPFS.cid(cid)
    },
    time: { type: Date, required: true },
    confirmed: { type: Boolean, default: false }
  },
  { strict: 'throw' }
)

class PinClass {
  static async removeOldUnconfirmedPins(ttl = process.env.TTL || 14) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - ttl)
    log('Finding and removing old pins...')
    const oldUnconfirmedPins = await this.find({
      confirmed: false,
      time: { $lt: cutoffDate }
    }).exec()

    await Promise.all(
      oldUnconfirmedPins.map(async pin => {
        log(`Found old unconfirmed pin with cid: ${pin.cid}`)
        // we check to make sure there isn't already a pin that has been confirmed with the same CID
        // guards against duplicate pins
        const confirmedPin = await this.findOne({
          cid: pin.cid,
          confirmed: true
        })

        if (!confirmedPin) await ipfs.node.pin.rm(pin.cid)
      })
    )
    // delete the unconfirmed pins that have lived too long
    const res = await this.deleteMany({
      confirmed: false,
      time: { $lt: cutoffDate }
    }).exec()
    if (res.deletedCount > 0)
      log(`Deleted ${res.deletedCount} pins successfully`)
  }
}

pinSchema.loadClass(PinClass)
module.exports = new mongoose.model('Pin', pinSchema)
