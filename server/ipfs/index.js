const ipfsClient = require('ipfs-http-client')

const ipfsWrapper = options => {
  const optionsFiltered = Object.fromEntries(
    Object.entries(options).filter(option => option[1])
  )

  const node = ipfsClient(optionsFiltered)
  const getAndPin = async cid => {
    const objToStore = await node.dag.get(cid)
    const newCid = await node.dag.put(objToStore.value)
    if (newCid.toBaseEncodedString() !== cid)
      throw new Error('Dag get returned different CID.')

    return node.pin.add(newCid.toBaseEncodedString())
  }

  return {
    node,
    getAndPin
  }
}

const ipfs = ipfsWrapper({
  host: process.env.IPFS_NODE_HOST || 'localhost',
  port: process.env.IPFS_NODE_PORT || '5002',
  protocol: process.env.IPFS_NODE_PROTOCOL || 'http',
  headers: process.env.IPFS_AUTH
    ? {
        Authorization: process.env.IPFS_AUTH
      }
    : null,
  'api-path': process.env.IPFS_API_PATH || null
})

module.exports = ipfs
