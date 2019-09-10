const {
	addSmartContract,
	getSmartContracts,
	initSmartContracts
} = require('./index')

const demoSmartContract = {
	smartContract: 'asdfasdfjahkj',
	network: 'MainNet',
	abi: 'whatever'
}

test('add/get smart contract', () => {
	initSmartContracts()
	addSmartContract(demoSmartContract)
	expect(getSmartContracts()).toMatchObject([demoSmartContract])
})

test('add two smart contracts', () => {
	initSmartContracts()
	addSmartContract(demoSmartContract)
	addSmartContract(demoSmartContract)

	expect(getSmartContracts().length).toBe(2)
})
