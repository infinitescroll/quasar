require('dotenv').config()

const BLOCKCHAIN_NETWORK = process.env.BLOCKCHAIN_NETWORK || 'local'
const BLOCKCHAIN_PROVIDER_HTTP_URL =
  process.env.BLOCKCHAIN_PROVIDER_HTTP_URL || ''

const DB_POLL_INTERVAL =
  process.env.NODE_ENV === 'test'
    ? 100
    : process.env.DB_POLL_INTERVAL || 604800000

const CONTRACT_POLL_INTERVAL =
  process.env.NODE_ENV === 'test'
    ? 100
    : process.env.CONTRACT_POLL_INTERVAL || 600000

const MAX_FILE_SIZE = process.env.MAX_FILE_SIZE || 1073741824
const BLOCK_PADDING = process.env.BLOCK_PADDING || 15
const TTL = process.env.TTL || 14

const IPFS_NODE_HOST = process.env.IPFS_NODE_HOST || 'localhost'
const IPFS_NODE_PROTOCOL = process.env.IPFS_NODE_PROTOCOL || 'http'
const IPFS_NODE_PORT = process.env.IPFS_NODE_PORT || '5002'
const IPFS_API_PATH = process.env.IPFS_API_PATH || ''
const IPFS_AUTH = process.env.IPFS_AUTH || ''

const baseUrlConstructor = (protocol, host, port, path) =>
  `${protocol}://${host}:${port}` + (path ? `/${path}` : '')

const BASE_IPFS_GATEWAY_URL = baseUrlConstructor(
  IPFS_NODE_PROTOCOL,
  IPFS_NODE_HOST,
  IPFS_NODE_PORT,
  IPFS_API_PATH
)

const DAG_GET_IPFS_ENDPOINT = 'dag/get?arg='
const DAG_PUT_IPFS_ENDPOINT = 'dag/put'

const STORAGE_CONTRACT_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: 'cid',
        type: 'string'
      }
    ],
    name: 'PinHash',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: 'provider',
        type: 'string'
      },
      {
        indexed: false,
        name: 'uri',
        type: 'string'
      },
      {
        indexed: false,
        name: 'providerSetter',
        type: 'address'
      }
    ],
    name: 'RegisterStorageProvider',
    type: 'event'
  },
  {
    constant: false,
    inputs: [
      {
        name: '_key',
        type: 'bytes32'
      },
      {
        name: '_value',
        type: 'string'
      }
    ],
    name: 'registerData',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      {
        name: '_key',
        type: 'bytes32'
      }
    ],
    name: 'getRegisteredData',
    outputs: [
      {
        name: '',
        type: 'string'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: 'newProvider',
        type: 'string'
      },
      {
        name: 'newUri',
        type: 'string'
      }
    ],
    name: 'registerStorageProvider',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'getStorageProvider',
    outputs: [
      {
        name: '',
        type: 'string'
      },
      {
        name: '',
        type: 'string'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  }
]

const STORAGE_REGISTRY_CONTRACT_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: 'contractAddress',
        type: 'address'
      }
    ],
    name: 'Register',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: 'contractAddress',
        type: 'address'
      }
    ],
    name: 'Unregister',
    type: 'event'
  },
  {
    constant: false,
    inputs: [
      {
        name: 'contractAddress',
        type: 'address'
      }
    ],
    name: 'registerContract',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: 'contractAddress',
        type: 'address'
      }
    ],
    name: 'unregisterContract',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  }
]

const STORAGE_REGISTRY_CONTRACT_ADDRESS =
  process.env.STORAGE_REGISTRY_CONTRACT_ADDRESS

let log = () => {}

if (process.env.NODE_ENV !== 'test') {
  log = message => {
    const time = Date.now()
    console.log(`${time}: ${message}`)
  }
}

module.exports = {
  BLOCKCHAIN_NETWORK,
  BLOCKCHAIN_PROVIDER_HTTP_URL,
  log,
  IPFS_NODE_HOST,
  IPFS_NODE_PROTOCOL,
  IPFS_NODE_PORT,
  IPFS_API_PATH,
  IPFS_AUTH,
  STORAGE_REGISTRY_CONTRACT_ABI,
  STORAGE_CONTRACT_ABI,
  DB_POLL_INTERVAL,
  CONTRACT_POLL_INTERVAL,
  MAX_FILE_SIZE,
  STORAGE_REGISTRY_CONTRACT_ADDRESS,
  BLOCK_PADDING,
  BASE_IPFS_GATEWAY_URL,
  DAG_GET_IPFS_ENDPOINT,
  DAG_PUT_IPFS_ENDPOINT,
  TTL,
  baseUrlConstructor
}
