const { List } = require('immutable')

let smartContracts
const initSmartContracts = () => {
	smartContracts = List()
}
initSmartContracts()

const addSmartContract = ({ smartContract, network, abi }) => {
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

module.exports = { getSmartContracts, addSmartContract, initSmartContracts }
