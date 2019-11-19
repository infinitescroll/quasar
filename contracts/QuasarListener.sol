pragma solidity ^0.4.24;

interface QuasarListener {
  event Listen(address contractAddress);
  event StopListening(address contractAddress);
}
