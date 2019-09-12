const { List } = require('immutable')
const ethereum = require('../utils/ethereum')

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

let smartContracts
const initSmartContracts = () => {
  smartContracts = List()
}

const unsubscribe = address => {
  const contract = smartContracts.find(i => i.address === address)
  contract.listener.unsubscribe()
  // Todo: remove item from immutable list
}

const addSmartContract = async smartContractObj => {
  const invalidFields = findInvalidSmartContractFields(smartContractObj)
  if (invalidFields.length > 0)
    throw new Error(
      `the following fields are missing or invalid: ${invalidFields.join(', ')}`
    )

  const contract = ethereum.getContract(smartContractObj)
  const listener = ethereum.registerWatcher(contract)
  if (!listener || !listener.unsubscribe)
    throw new Error('There was a problem registering the smart contract.')

  smartContractObj.listener = listener
  smartContracts = smartContracts.push(smartContractObj)
}

const getSmartContracts = () => {
  return smartContracts.toArray()
}

initSmartContracts()

module.exports = {
  getSmartContracts,
  addSmartContract,
  initSmartContracts,
  unsubscribe
}
