const ipfs = require('./')

let node
let getAndPin

beforeAll(() => {
  node = ipfs.node
  getAndPin = ipfs.getAndPin
})

test('getAndPin gets and pins object that was added by dag.put', async done => {
  const dag = { test: 'value' }
  const cid = await node.dag.put(dag)
  let pins = await node.pin.ls()
  let match = pins.find(item => item.hash === cid.toBaseEncodedString())
  if (match) {
    await node.pin.rm(cid.toBaseEncodedString())
    pins = await node.pin.ls()
    match = pins.find(item => item.hash === cid.toBaseEncodedString())
  }

  expect(match).toBeUndefined()

  const hashObj = await getAndPin(cid.toBaseEncodedString())
  expect(hashObj[0].hash).toBe(cid.toBaseEncodedString())
  done()
}, 20000)
