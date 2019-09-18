var Listener = artifacts.require('./Listener.sol') // eslint-disable-line no-undef

module.exports = function(deployer) {
  deployer.deploy(Listener)
}
