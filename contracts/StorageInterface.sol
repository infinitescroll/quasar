pragma solidity ^0.4.24;

interface StorageInterface {

    /// Events
    event PinHash(string cid);
    event RegisterStorageProvider(string provider, string uri, address providerSetter);

    /**
     * @notice Set `_key` data to `_value`
     * @param _key Data item that will be stored in the registry
     * @param _value Data content to be stored
     */

    function registerData(bytes32 _key, string _value) external;

    function getRegisteredData(bytes32 _key) external view returns(string)

    function registerStorageProvider(string newProvider, string newUri) external;

    function getStorageProvider() external view returns(string, string);
}
