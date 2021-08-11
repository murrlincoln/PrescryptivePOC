const PrescryptiveSmartContract = artifacts.require("PrescryptiveSmartContract");

var account2 = '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD'

module.exports = function (deployer) {
  deployer.deploy(PrescryptiveSmartContract, account2);
};
