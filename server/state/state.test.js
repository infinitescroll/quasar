const {
  addSmartContract,
  getSmartContracts,
  initSmartContracts
} = require('./index')

const demoSmartContract = {
  smartContract: 'asdfasdfjahkj',
  network: 'mainnet',
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

test('robustly handle malformed smart contracts', () => {
  expect(addSmartContract({ wrong: 'keys' })).toBe(
    'Error: smartContract is missing or invalid. Error: network is missing or invalid. Error: abi is missing or invalid.'
  )

  expect(addSmartContract({ smartContract: 'keys' })).toBe(
    'Error: network is missing or invalid. Error: abi is missing or invalid.'
  )

  expect(
    addSmartContract({ smartContract: 'keys', network: 'wrongnetwork' })
  ).toBe(
    'Error: network is missing or invalid. Error: abi is missing or invalid.'
  )

  expect(addSmartContract({ smartContract: 'keys', network: 'rinkeby' })).toBe(
    'Error: abi is missing or invalid.'
  )
})
