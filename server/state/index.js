const { List } = require('immutable')

const smartContractSchema = {
  smartContract: val => typeof val === 'string',
  network: val =>
    val &&
    (val.toLowerCase() === 'rinkeby' ||
      val.toLowerCase() === 'mainnet' ||
      val.toLowerCase() === 'localhost'),
  abi: val => typeof val === 'string'
}

const findInvalidSmartContractFields = smartContractObj =>
  Object.entries(smartContractSchema).reduce((errors, [property, validate]) => {
    if (!validate(smartContractObj[property])) {
      errors.push(new Error(`${property} is missing or invalid.`))
    }
    return errors
  }, [])

let smartContracts
const initSmartContracts = () => {
  smartContracts = List()
}

const addSmartContract = smartContractObj => {
  const invalidFields = findInvalidSmartContractFields(smartContractObj)
  if (invalidFields.length > 0) return invalidFields.join(' ')

  smartContracts = smartContracts.push(smartContractObj)
  return
}

const getSmartContracts = () => {
  return smartContracts.toArray()
}

initSmartContracts()

module.exports = { getSmartContracts, addSmartContract, initSmartContracts }
