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
const demoSmartContract2 = {
  smartContract: 'asoijijiji',
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
  addSmartContract(demoSmartContract2)

  expect(getSmartContracts().length).toBe(2)
})

test('robustly handle malformed smart contracts', async () => {
  await expect(addSmartContract({ wrong: 'keys' })).rejects.toThrow(
    'the following fields are missing or invalid: smartContract, network, abi'
  )

  await expect(addSmartContract({ smartContract: 'keys' })).rejects.toThrow(
    'the following fields are missing or invalid: network, abi'
  )

  await expect(
    addSmartContract({ smartContract: 'keys', network: 'wrongnetwork' })
  ).rejects.toThrow('the following fields are missing or invalid: network, abi')

  await expect(
    addSmartContract({ smartContract: 'keys', network: 'rinkeby' })
  ).rejects.toThrow('the following fields are missing or invalid: abi')
})

test('do not add duplicate smart contract', async () => {
  addSmartContract(demoSmartContract)
  await expect(addSmartContract(demoSmartContract)).rejects.toThrow(
    'already listening to the contract at this address'
  )
})
