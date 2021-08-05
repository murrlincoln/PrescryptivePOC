const PrescryptiveSmartContract = artifacts.require("PrescryptiveSmartContract");

var account2 = '0x0183F5730F2B7ef8cbBaBbeAc6Fe0120AA524170'

module.exports = function (deployer) {
  deployer.deploy(PrescryptiveSmartContract, account2);
};
