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

test('adding/get smart contract works', () => {
  initSmartContracts()
  addSmartContract(demoSmartContract)
  expect(getSmartContracts()).toMatchObject([demoSmartContract])
})

test('adding two different smart contracts works', () => {
  initSmartContracts()
  addSmartContract(demoSmartContract)
  addSmartContract(demoSmartContract2)

  expect(getSmartContracts().length).toBe(2)
})

test('adding malformed smart contract throws helpful error', async () => {
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

test('adding duplicate smart contract throws error', async () => {
  addSmartContract(demoSmartContract)
  await expect(addSmartContract(demoSmartContract)).rejects.toThrow(
    'already listening to the contract at this address'
  )
})
