const mongoose = require('mongoose')
const web3 = require('web3')

const pinEventSourceSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      validate: contractAddress => web3.utils.isAddress(contractAddress)
    },
    lastPolledBlock: {
      type: Number,
      default: 0
    },
    sizeOfPinnedData: {
      type: Number,
      default: 0
    }
  },
  { strict: 'throw' }
)

module.exports = new mongoose.model('PinEventSource', pinEventSourceSchema)
