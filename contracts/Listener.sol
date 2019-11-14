pragma solidity ^0.4.24;

import "./QuasarListener.sol";

contract Listener is QuasarListener {

  /// Events
  event Listen(address contractAddress);
  event StopListening(address contractAddress);

  /**
     * @notice Set `address` data to `true`
     * @param contractAddress address of new smart contract to listen to
     */


  function listenToContract(address contractAddress) external {
    emit Listen(contractAddress);
  }

  function unsubscribeContract(address contractAddress) external {
    emit StopListening(contractAddress);
  }
}
