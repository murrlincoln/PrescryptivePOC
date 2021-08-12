const PrescryptiveSmartContract = artifacts.require("PrescryptiveSmartContract");

var account3 = '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD' //DAI on Kovan

module.exports = function (deployer) {
  deployer.deploy(PrescryptiveSmartContract, account3);
};
