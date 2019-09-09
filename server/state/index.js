const { List }= require('immutable')

const initialState = List()

var smartContracts = initialState

const addSmartContract = ({smartContract, network, abi}) => {
    let smartContractToAdd = {
        smartContract,
        network,
        abi
    }
    smartContracts = smartContracts.push(smartContractToAdd)
}

const getSmartContracts = () => {
    return smartContracts.toArray()
}

module.exports = {getSmartContracts, addSmartContract}
