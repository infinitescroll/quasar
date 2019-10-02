const ipfs = require('./')

let node
let getAndPin

beforeAll(async done => {
  node = ipfs.node
  getAndPin = ipfs.getAndPin
  const pins = await node.pin.ls({ recursive: true })
  await Promise.all(pins.map(pin => node.pin.rm(pin.hash, { recursive: true })))
  done()
})

test('getAndPin gets and pins object that was added by dag.put', async done => {
  const dag = { test: 'value' }
  const cid = await node.dag.put(dag)
  const pins = await node.pin.ls()
  const match = pins.find(item => item.hash === cid.toBaseEncodedString())
  expect(match).toBeUndefined()

  const hashObj = await getAndPin(cid.toBaseEncodedString())
  expect(hashObj[0].hash).toBe(cid.toBaseEncodedString())
  const newPinSet = await node.pin.ls()
  expect(
    newPinSet.find(item => item.hash === cid.toBaseEncodedString())
  ).toBeDefined()

  done()
})
