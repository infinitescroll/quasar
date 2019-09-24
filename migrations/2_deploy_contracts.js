const Storage = artifacts.require('./Storage.sol') // eslint-disable-line no-undef
const Listener = artifacts.require('./Listener.sol') // eslint-disable-line no-undef

module.exports = function(deployer) {
  deployer.deploy(Storage)
  deployer.deploy(Listener)
}
