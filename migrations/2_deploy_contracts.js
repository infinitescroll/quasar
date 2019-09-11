var Storage = artifacts.require('./Storage.sol') // eslint-disable-line no-undef

module.exports = function(deployer) {
  deployer.deploy(Storage)
}
