const PrescryptiveSmartContract = artifacts.require("PrescryptiveSmartContract");

var account3 = '0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e' //USDC on Mumbai

module.exports = function (deployer) {
  deployer.deploy(PrescryptiveSmartContract, account3);
};
