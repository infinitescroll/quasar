const ipfsClient = require('ipfs-http-client')

let node

const getAndPin = async cid => {
  return await node.dag
    .get(cid)
    .then(res => {
      return node.dag
        .put(res.value)
        .then(res => {
          if (res.toBaseEncodedString('base32') !== cid)
            throw new Error('Error pinning dag.')
          return node.pin.add(res.toBaseEncodedString('base32'))
        })
        .catch(error => {
          return error
        })
    })
    .catch(error => {
      return error
    })
}

const init = () => {
  const host = process.env.IPFS_NODE_HOST
    ? process.env.IPFS_NODE_HOST
    : 'localhost'

  const port = process.env.IPFS_NODE_PORT ? process.env.IPFS_NODE_PORT : '5001'

  const protocol = process.env.IPFS_NODE_PROTOCOL
    ? process.env.IPFS_NODE_PROTOCOL
    : 'http'

  node = ipfsClient({ host, port, protocol })

  node.refs.local().catch(_ => {
    process.on('exit', () => {
      console.log('🛑  Closing app. No IPFS node found.')
    })
    process.exit()
  })
}

module.exports = { node, getAndPin, init }
