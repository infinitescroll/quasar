const smartContracts = require('./')
const {
  demoSmartContractJson1,
  demoSmartContractJson2
} = require('../../mockData')

beforeEach(() => {
  smartContracts.clear()
})

test('adding/getting smart contract works', async () => {
  await smartContracts.add(demoSmartContractJson1)
  expect(smartContracts.get()).toMatchObject([demoSmartContractJson1])
})

test('adding two different smart contracts works', async () => {
  await smartContracts.add(demoSmartContractJson1)
  await smartContracts.add(demoSmartContractJson2)

  expect(smartContracts.get().length).toBe(2)
})

test('adding malformed smart contract throws helpful error', async () => {
  await expect(smartContracts.add({ wrong: 'address' })).rejects.toThrow(
    'the following fields are missing or invalid: address, abi'
  )

  await expect(smartContracts.add({ address: 'address' })).rejects.toThrow(
    'the following fields are missing or invalid: abi'
  )

  await expect(smartContracts.add({ abi: [] })).rejects.toThrow(
    'the following fields are missing or invalid: address'
  )

  await expect(smartContracts.add({ abi: 'wrong abi' })).rejects.toThrow(
    'the following fields are missing or invalid: address'
  )
})

test('adding duplicate smart contract throws error', async () => {
  smartContracts.add(demoSmartContractJson1)
  await expect(smartContracts.add(demoSmartContractJson1)).rejects.toThrow(
    'already listening to the contract at this address'
  )
})

test('unsubscribing removes smart contract from state', async () => {
  smartContracts.add(demoSmartContractJson1)
  expect(smartContracts.get().length).toBe(1)

  smartContracts.unsubscribe(demoSmartContractJson1.address)
  expect(smartContracts.get().length).toBe(0)
})
