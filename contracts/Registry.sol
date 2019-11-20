pragma solidity ^0.4.24;

import "./StorageRegistry.sol";

contract Registry is StorageRegistry {

  /// Events
  event Register(address contractAddress);
  event Unregister(address contractAddress);

  /**
     * @param contractAddress address of new smart contract to listen to
     */

  function registerContract(address contractAddress) external {
    emit Register(contractAddress);
  }

  function unregisterContract(address contractAddress) external {
    emit Unregister(contractAddress);
  }
}
