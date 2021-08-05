var ERC20Test = artifacts.require("ERC20Test");

module.exports = function(deployer) {
    deployer.deploy(ERC20Test);
    // Additional contracts can be deployed here
};