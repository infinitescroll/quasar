const Storage = artifacts.require('./Storage.sol') // eslint-disable-line no-undef
const Registry = artifacts.require('./Registry.sol') // eslint-disable-line no-undef

module.exports = function(deployer) {
  deployer.deploy(Storage)
  deployer.deploy(Registry)
}
