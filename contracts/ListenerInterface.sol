pragma solidity ^0.4.24;

interface ListenerInterface {

  /// Events
  event Listen(address contractAddress);
  event StopListening(address contractAddress);

  /**
     * @notice Set `address` data to `true`
     * @param contractAddress address of new smart contract to listen to
     */


  function listenToContract(address contractAddress) external;

  function unsubscribeContract(address contractAddress) external;
}
