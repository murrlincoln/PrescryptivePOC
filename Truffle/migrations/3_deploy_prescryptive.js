const PrescryptiveSmartContrac = artifacts.require("PrescryptiveSmartContrac");

var account2 = '0xB31A83da6adCb22d3665CbcB96178323B05472A3'

module.exports = function (deployer) {
  deployer.deploy(PrescryptiveSmartContrac, account2);
};
