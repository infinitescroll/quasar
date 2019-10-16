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

module.exports = { LISTENER_CONTRACT_ABI, STORAGE_CONTRACT_ABI }
