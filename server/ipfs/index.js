const ipfsClient = require('ipfs-http-client')

let node

const init = async () => {
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

const pin = () => {
  console.log('node', !!node)
}

module.exports = { init, node, pin }
