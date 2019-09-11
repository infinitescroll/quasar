const {
  addSmartContract,
  getSmartContracts,
  initSmartContracts
} = require('./index')

const demoSmartContract = {
  address: 'asdfasdfjahkj',
  network: 'mainnet',
  abi: { name: 'contractName' }
}
const demoSmartContract2 = {
  address: 'asoijijiji',
  network: 'mainnet',
  abi: { name: 'contractName' }
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

test('do not add duplicate smart contract', async () => {
  addSmartContract(demoSmartContract)
  await expect(addSmartContract(demoSmartContract)).rejects.toThrow(
    'already listening to the contract at this address'
  )
})
