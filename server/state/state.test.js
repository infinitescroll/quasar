const state = require('./')
const {
  demoSmartContractJson1,
  demoSmartContractJson2
} = require('../../mockData')

beforeEach(() => {
  state.clear()
})

test('adding/getting smart contract works', async () => {
  await state.add(demoSmartContractJson1)
  expect(state.get()).toMatchObject([demoSmartContractJson1])
})

test('adding two different smart contracts works', async () => {
  await state.add(demoSmartContractJson1)
  await state.add(demoSmartContractJson2)

  expect(state.get().length).toBe(2)
})

test('adding malformed smart contract throws helpful error', async () => {
  await expect(state.add({ wrong: 'address' })).rejects.toThrow(
    'the following fields are missing or invalid: address, network, abi'
  )

  await expect(state.add({ address: 'address' })).rejects.toThrow(
    'the following fields are missing or invalid: network, abi'
  )

  await expect(
    state.add({ address: 'address', network: 'wrongnetwork' })
  ).rejects.toThrow('the following fields are missing or invalid: network, abi')

  await expect(
    state.add({ address: 'address', network: 'rinkeby' })
  ).rejects.toThrow('the following fields are missing or invalid: abi')
})

test('adding duplicate smart contract throws error', async () => {
  state.add(demoSmartContractJson1)
  await expect(state.add(demoSmartContractJson1)).rejects.toThrow(
    'already listening to the contract at this address'
  )
})
