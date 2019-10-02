const ipfs = require('./')

let node
let getAndPin

const removeHashIfPinned = async cid => {
  const pins = await node.pin.ls()
  const match = pins.find(item => item.hash === cid)
  if (match) return node.pin.rm(match.hash)
  return
}

beforeAll(async done => {
  node = ipfs.node
  getAndPin = ipfs.getAndPin
  done()
})

test('getAndPin gets and pins object that was added by dag.put', async done => {
  const dag = { test: 'value' }
  const cid = await node.dag.put(dag)
  await removeHashIfPinned(cid.toBaseEncodedString())

  const hashObj = await getAndPin(cid.toBaseEncodedString())
  expect(hashObj[0].hash).toBe(cid.toBaseEncodedString())
  const newPinSet = await node.pin.ls()
  expect(
    newPinSet.find(item => item.hash === cid.toBaseEncodedString())
  ).toBeDefined()

  done()
})
