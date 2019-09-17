const { List } = require('immutable')
// const ethereum = require('../ethereum')

class smartContractsStore {
  constructor() {
    this.smartContracts = List()
  }

  get() {
    return this.smartContracts.toArray()
  }

  unsubscribe(address) {
    const contractIndex = this.smartContracts.findIndex(
      i => i.address === address
    )
    this.smartContracts.get(contractIndex).listener.unsubscribe()
    this.smartContracts = this.smartContracts.delete(contractIndex)
  }

  async add(smartContractObj) {
    const invalidFields = findInvalidSmartContractFields(smartContractObj)
    if (invalidFields.length > 0) {
      throw new Error(
        `the following fields are missing or invalid: ${invalidFields.join(
          ', '
        )}`
      )
    }
    if (isDuplicateSmartContract(smartContractObj.address)) {
      throw new Error('already listening to the contract at this address')
    }

    // const contract = ethereum.getContract(smartContractObj)
    // const listener = ethereum.registerWatcher(contract)
    // smartContractObj.listener = listener
    this.smartContracts = this.smartContracts.push(smartContractObj)
  }

  clear() {
    this.smartContracts = List()
  }
}

const smartContractSchema = {
  address: val => typeof val === 'string',
  network: val =>
    val &&
    (val.toLowerCase() === 'rinkeby' ||
      val.toLowerCase() === 'mainnet' ||
      val.toLowerCase() === 'localhost'),
  abi: val => typeof val === 'object'
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

const smartContracts = new smartContractsStore()

module.exports.default = smartContracts
