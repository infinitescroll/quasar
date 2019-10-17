const mongoose = require('mongoose')
const web3 = require('web3')

const listenerContractToPollSchema = new mongoose.Schema(
  {
    address: {
      index: true,
      type: String,
      required: true,
      validate: contractAddress => web3.utils.isAddress(contractAddress)
    },
    lastPolledBlock: {
      type: Number,
      default: 0
    }
  },
  { strict: 'throw' }
)

module.exports = new mongoose.model(
  'ListenerContractToPoll',
  listenerContractToPollSchema
)
