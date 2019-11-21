const ipfsClient = require('ipfs-http-client')
const {
  log,
  IPFS_NODE_HOST,
  IPFS_NODE_PROTOCOL,
  IPFS_NODE_PORT,
  IPFS_API_PATH,
  IPFS_AUTH
} = require('../constants')

const options = {
  host: IPFS_NODE_HOST,
  port: IPFS_NODE_PORT,
  protocol: IPFS_NODE_PROTOCOL,
  headers: IPFS_AUTH
    ? {
        Authorization: IPFS_AUTH
      }
    : null,
  'api-path': IPFS_API_PATH
}

// this function can be improved when we add more headers
const formatHeaders = options => {
  if (!options.headers) delete options.headers
  return options
}

const removeEmptyFields = options => {
  const newOptions = {}
  Object.keys(options).forEach(key => {
    if (options[key]) newOptions[key] = options[key]
  })
  return newOptions
}

log(
  'Started IPFS node with options: ',
  removeEmptyFields(formatHeaders(options))
)

const node = new ipfsClient(removeEmptyFields(formatHeaders(options)))

module.exports = { node, formatHeaders, removeEmptyFields }
