const {
  addSmartContract,
  getSmartContracts,
  initSmartContracts
} = require('./index')
const { demoSmartContractJson } = require('../../mockData')

test('add/get smart contract', () => {
  initSmartContracts()
  addSmartContract(demoSmartContractJson)
  expect(getSmartContracts()).toMatchObject([demoSmartContractJson])
})

test('add two smart contracts', () => {
  initSmartContracts()
  addSmartContract(demoSmartContractJson)
  addSmartContract(demoSmartContractJson)

  expect(getSmartContracts().length).toBe(2)
})

test('robustly handle malformed smart contracts', async () => {
  await expect(addSmartContract({ wrong: 'address' })).rejects.toThrow(
    'the following fields are missing or invalid: address, network, abi'
  )

  await expect(addSmartContract({ address: 'address' })).rejects.toThrow(
    'the following fields are missing or invalid: network, abi'
  )

  await expect(
    addSmartContract({ address: 'address', network: 'wrongnetwork' })
  ).rejects.toThrow('the following fields are missing or invalid: network, abi')

  await expect(
    addSmartContract({ address: 'address', network: 'rinkeby' })
  ).rejects.toThrow('the following fields are missing or invalid: abi')
})
