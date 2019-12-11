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
    console.log('removing old ones')
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - ttl)
    log('Finding and removing old pins...')
    const oldUnconfirmedPins = await this.find({
      confirmed: false,
      time: { $lt: cutoffDate }
    }).exec()
    oldUnconfirmedPins.forEach(pin => {
      log(`Found old unconfirmed pin with cid: ${pin.cid}`)
    })
    console.log('going through them')
    await Promise.all(
      oldUnconfirmedPins.map(async pin => {
        const confirmedPin = await this.findOne({
          cid: pin.cid,
          confirmed: true
        })
        if (!confirmedPin) await ipfs.node.pin.rm(pin.cid)
      })
    )
    console.log('deleting')
    await this.deleteMany({
      confirmed: false,
      time: { $lt: cutoffDate }
    }).exec()
    console.log('oldUnconfirmedPins.length', oldUnconfirmedPins.length)
    if (oldUnconfirmedPins.length > 0) log('Deleted pins successfully')
  }
}

pinSchema.loadClass(PinClass)
module.exports = new mongoose.model('Pin', pinSchema)
