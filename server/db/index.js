const Pin = require('./pinSchema')
const StorageContract = require('./storageContractSchema')
const StorageRegistryContract = require('./storageRegistryContractSchema')
const registerPinChecker = require('./pinChecker')

module.exports = {
  StorageRegistryContract,
  Pin,
  StorageContract,
  registerPinChecker
}
