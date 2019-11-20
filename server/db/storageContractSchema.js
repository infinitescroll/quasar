const mongoose = require('mongoose')
const web3 = require('web3')

const storageContractSchema = new mongoose.Schema(
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
    },
    sizeOfPinnedData: {
      type: Number,
      default: 0
    }
  },
  { strict: 'throw' }
)

class StorageContractClass {
  static async createIfDNE({ address }) {
    const storageContract = await this.findOne({ address })
    if (!storageContract) {
      await this.create({
        address,
        lastPolledBlock: 0,
        sizeOfPinnedData: 0
      })
    }
    return
  }
}

storageContractSchema.loadClass(StorageContractClass)

module.exports = new mongoose.model('StorageContract', storageContractSchema)
