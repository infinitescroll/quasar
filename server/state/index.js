const { List } = require('immutable')
// const ethereum = require('../ethereum')

const SmartContractsStore = () => {
  let smartContracts = List()
  return {
    get: () => {
      return smartContracts.toArray()
    },

    unsubscribe: address => {
      const contractIndex = smartContracts.findIndex(i => i.address === address)
      const contractToRemove = smartContracts.get(contractIndex)

      if (contractToRemove && contractToRemove.listener) {
        contractToRemove.listener.unsubscribe()
        smartContracts = smartContracts.delete(contractIndex)
      }
    },

    add: async smartContractObj => {
      const invalidFields = findInvalidSmartContractFields(smartContractObj)

      if (invalidFields.length > 0) {
        throw new Error(
          `the following fields are missing or invalid: ${invalidFields.join(
            ', '
          )}`
        )
      }

      if (isDuplicateSmartContract(smartContracts, smartContractObj.address)) {
        throw new Error('already listening to the contract at this address')
      }

      // const contract = ethereum.getContract(smartContractObj)
      // const listener = ethereum.registerWatcher(contract)
      // smartContractObj.listener = listener
      smartContracts = smartContracts.push(smartContractObj)
    },

    clear: () => {
      smartContracts = List()
    }
  }
}

const smartContractSchema = {
  address: val => typeof val === 'string',
  abi: val => Array.isArray(val)
}

const findInvalidSmartContractFields = smartContractObj =>
  Object.entries(smartContractSchema).reduce((errors, [property, validate]) => {
    if (!validate(smartContractObj[property])) {
      errors.push(`${property}`)
    }
    return errors
  }, [])

const isDuplicateSmartContract = (smartContracts, address) =>
  smartContracts.find(smartContractObj => smartContractObj.address === address)

const smartContracts = SmartContractsStore()
module.exports = smartContracts
