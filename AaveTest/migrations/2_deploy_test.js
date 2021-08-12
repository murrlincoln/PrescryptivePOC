const LendingPoolTest = artifacts.require("LendingPoolTest");


module.exports = function (deployer) {
  deployer.deploy(LendingPoolTest);
};
