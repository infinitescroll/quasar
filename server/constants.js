const DB_POLL_INTERVAL = process.env.DB_POLL_INTERVAL || 604800000
const CONTRACT_POLL_INTERVAL = process.env.CONTRACT_POLL_INTERVAL || 600000
const BLOCK_PADDING = process.env.BLOCK_PADDING || 15

const IPFS_NODE_HOST = process.env.IPFS_NODE_HOST || 'localhost'
const IPFS_NODE_PROTOCOL = process.env.IPFS_NODE_PROTOCOL || 'https'
const IPFS_NODE_PORT = process.env.IPFS_NODE_PORT || '5001'
const IPFS_API_PATH = process.env.IPFS_API_PATH || ''
const BASE_IPFS_GATEWAY_URL = `${IPFS_NODE_PROTOCOL}://${IPFS_NODE_HOST}:${IPFS_NODE_PORT}${IPFS_API_PATH}`

const DAG_GET_IPFS_GATEWAY_URL = 'dag/get?arg='

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

const LISTENER_CONTRACT_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: 'contractAddress',
        type: 'address'
      }
    ],
    name: 'Listen',
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
    name: 'StopListening',
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
    name: 'listenToContract',
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
    name: 'unsubscribeContract',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  }
]
const LISTENER_CONTRACT_ADDRESS = process.env.LISTENER_CONTRACT_ADDRESS

module.exports = {
  LISTENER_CONTRACT_ABI,
  STORAGE_CONTRACT_ABI,
  DB_POLL_INTERVAL,
  CONTRACT_POLL_INTERVAL,
  LISTENER_CONTRACT_ADDRESS,
  BLOCK_PADDING,
  BASE_IPFS_GATEWAY_URL,
  DAG_GET_IPFS_GATEWAY_URL
}
