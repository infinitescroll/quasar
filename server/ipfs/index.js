const ipfsClient = require('ipfs-http-client')

const options = {
  host: process.env.IPFS_NODE_HOST || 'localhost',
  port: process.env.IPFS_NODE_PORT || '5002',
  protocol: process.env.IPFS_NODE_PROTOCOL || 'http',
  headers: process.env.IPFS_AUTH
    ? {
        Authorization: process.env.IPFS_AUTH
      }
    : null,
  'api-path': process.env.IPFS_API_PATH || null
}

const optionsFiltered = Object.fromEntries(
  Object.entries(options).filter(option => option[1])
)
const node = new ipfsClient(optionsFiltered)

module.exports = { node }
