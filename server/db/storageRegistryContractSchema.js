const mongoose = require('mongoose')
const web3 = require('web3')

const storageRegistrySchema = new mongoose.Schema(
  {
    address: {
      index: true,
      type: String,
      required: true,
      unique: true,
      validate: contractAddress => web3.utils.isAddress(contractAddress)
    },
    lastPolledBlock: {
      type: Number,
      default: 0
    }
  },
  { strict: 'throw' }
)

class StorageRegistryContractClass {
  static async findOrCreate({ address }) {
    const storageRegistryContract = await this.findOne({ address })
    if (!storageRegistryContract) {
      return this.create({
        address,
        lastPolledBlock: 0
      })
    }
    return storageRegistryContract
  }
}

storageRegistrySchema.loadClass(StorageRegistryContractClass)

module.exports = new mongoose.model(
  'StorageRegistryContract',
  storageRegistrySchema
)
