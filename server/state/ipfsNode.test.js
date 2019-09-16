const ipfsWrapper = require('./ipfsNode')
const dag = { test: 'dag' }

const { node, getAndPin } = ipfsWrapper({
  host: process.env.IPFS_NODE_HOST ? process.env.IPFS_NODE_HOST : 'localhost',
  port: process.env.IPFS_NODE_PORT ? process.env.IPFS_NODE_PORT : '5001',
  protocol: process.env.IPFS_NODE_PROTOCOL
    ? process.env.IPFS_NODE_PROTOCOL
    : 'http',
  headers: null
})

test('getAndPin gets and pins object that was added by dag.put', async done => {
  const cid = await node.dag.put(dag)
  const hashObj = await getAndPin(cid.toBaseEncodedString())

  expect(hashObj[0].hash).toBe(cid.toBaseEncodedString())
  done()
})
