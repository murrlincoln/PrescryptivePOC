// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.6;
import '../../node_modules/@openzeppelin/contracts/access/AccessControl.sol'; //allows for different roles to be created
import '../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol'; //the ERC20 interface, so that we can transfer tokens to and from smart contract
contract PrescryptiveSmartContract is AccessControl {

    //Role used for adding a withdrawer
    bytes32 public constant WITHDRAW_ROLE = keccak256("WITHDRAW_ROLE");

    address erc20Contract; //the contract for the token/stablecoin

    ERC20 public stablecoin;

    constructor(address _erc20) {
        //make the sender both the admin and have withdraw rights
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(WITHDRAW_ROLE, msg.sender);

        //add the interaction interface with the token
        stablecoin = ERC20(_erc20);
        erc20Contract = _erc20;

    }

    //depending on setup of the smart contract, the withdraw role may be unnecessary, 
    //if there is only one entity who should have access

    //TODO - determine if onlyRole is required, due to the modifier already existing within the grant/revoke function
    /**
    * @dev Adds another withdrawer role to the smart contract, which can withdraw funds and do nothing else
     */
    function addWithdrawer(address _newWithdrawer) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(WITHDRAW_ROLE, _newWithdrawer);
    }

    /**
     * @dev removes the withdraw role from an address, meaning they can no longer withdraw funds
     */
    function removeWithdrawer(address _withdrawer) public onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(WITHDRAW_ROLE, _withdrawer);
    }

    /**
     * @dev Approves the token transferring from the caller to the smart contract. First step in a deposit.
     * Should only be done once per depositer, otherwise it would be redundant.
     */
    function approveTokenTransfer() external {
        stablecoin.approve(address(this), 79228162514260000000000000000);
    }


    /**
     * @dev - When funds are deposited through this function in the smart contract, 
        they will be sent to Aave and turn into yield-bearing
        Note: Function will fail if approval not given first.
     */
    function depositFunds(uint256 _value) public {
        //Transfers token from caller to contract, then takes the token and converts it to interest-bearing via Aave
        stablecoin.transferFrom(msg.sender, address(this), _value);

        //TODO - Add Aave integration (not possible until testnet release)
    }

    /**
     * @dev - Withdraws funds from Aave then to the msg.sender 
     */
    function withdrawFunds(uint256 _value) public onlyRole(WITHDRAW_ROLE) {
        stablecoin.transfer(msg.sender, _value);
        //todo - need emit here?
    }




}

