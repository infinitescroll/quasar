const IPFS = require('ipfs')
const ipfsWrapper = require('./')
const dag = { test: 'dag' }
let node
let getAndPin

beforeAll(async () => {
  await IPFS.create()
  const ipfsWrapped = ipfsWrapper({
    host: 'localhost',
    port: '5001',
    protocol: 'http'
  })
  node = ipfsWrapped.node
  getAndPin = ipfsWrapped.getAndPin
})

test('getAndPin gets and pins object that was added by dag.put', async done => {
  const cid = await node.dag.put(dag)
  const hashObj = await getAndPin(cid.toBaseEncodedString())

  expect(hashObj[0].hash).toBe(cid.toBaseEncodedString())
  done()
})
