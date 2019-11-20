pragma solidity ^0.4.24;

interface StorageRegistry {
  event Register(address contractAddress);
  event Unregister(address contractAddress);
}
