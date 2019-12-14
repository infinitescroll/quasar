pragma solidity ^0.4.24;

import "./DataStore.sol";


contract Storage is DataStore {

    /// Events
    event PinHash(string cid);

    /// State: data registry
    mapping(bytes32 => string) internal registeredData;

    /**
     * @notice Set `_key` data to `_value`
     * @param _key Data item that will be stored in the registry
     * @param _value Data content to be stored
     */

    function registerData(bytes32 _key, string _value) external {
        // TODO: check that _key is an app proxy
        // TODO: check that _key is installed in this org
        registeredData[_key] = _value;
        emit PinHash(_value);
    }

    function getRegisteredData(bytes32 _key) external view returns(string) {
        return registeredData[_key];
    }
}
