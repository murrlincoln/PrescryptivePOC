// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.6;
import '../../node_modules/@openzeppelin/contracts/access/AccessControl.sol'; //allows for different roles to be created
import '../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol'; //the ERC20 interface, so that we can transfer tokens to and from smart contract

contract PrescryptiveSmartContract is AccessControl {

    //Role used for adding a withdrawer
    bytes32 public constant WITHDRAW_ROLE = keccak256("WITHDRAW_ROLE");

    //Role for the financial team who will confirm or deny tx
    bytes32 public constant CONFIRM_WITHDRAW_ROLE = keccak256("CONFIRM_WITHDRAW_ROLE");

    address erc20Contract; //the contract for the token/stablecoin

    ERC20 public stablecoin;

    bool private withdrawInitated = false; //tells if the withdraw has been initated or not
    uint public withdrawValue; //the value of the withdrawal
    address public withdrawAddress; //the address of the withdrawal
    address public owner; //DEFAULT_ADMIN_ROLE address

    constructor(address _erc20) {
        //make the sender (the payer) both the admin and have withdraw rights
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender); 
        _setupRole(WITHDRAW_ROLE, msg.sender);
        owner = msg.sender;

        //add the interaction interface with the token
        stablecoin = ERC20(_erc20);
        erc20Contract = _erc20;

    }

    //depending on setup of the smart contract, the withdraw role may be unnecessary, 
    //if there is only one entity who should have access

    /**
     * @dev - Changes the owner to a new address
     */
    function changeOwner(address _newOwner) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(DEFAULT_ADMIN_ROLE, _newOwner);
        revokeRole(DEFAULT_ADMIN_ROLE, owner);
        owner = _newOwner;
    }

    /**
    * @dev Adds another withdrawer role to the smart contract, which can withdraw funds and do nothing else
     */
    function addWithdrawer(address _newWithdrawer) public {
        grantRole(WITHDRAW_ROLE, _newWithdrawer);
    }

    /**
     * @dev removes the withdraw role from an address, meaning they can no longer withdraw funds
     */
    function removeConfirmer(address _newConfirmer) public {
        revokeRole(CONFIRM_WITHDRAW_ROLE, _newConfirmer);
    }


    /**
     * @dev Adds another confirmer role to the smart contract, which can confirm withdraw of funds and do nothing else
     */
    function addConfirmer(address _newConfirmer) public {
        grantRole(CONFIRM_WITHDRAW_ROLE, _newConfirmer);
    }

    /**
     * @dev removes the confirmer role from an address, meaning they can no longer confirm withdraw of funds
     */
    function removeWithdrawer(address _withdrawer) public {
        revokeRole(CONFIRM_WITHDRAW_ROLE, _withdrawer);
    }

    /**
     * @dev - When funds are deposited through this function in the smart contract, 
        they will be sent to Aave and turn into yield-bearing
        Note: Function will fail if approval (stablecoin.approve(smartContractAddress, 79228162514260000000000000000)) not given first.
     */
    function depositFunds(uint256 _value) public {
        //Transfers token from caller to contract, then takes the token and converts it to interest-bearing via Aave
        stablecoin.transferFrom(msg.sender, address(this), _value);

        //TODO - Add Aave integration (not possible until testnet release)
    }


    /**
     * @dev - The first step in the withdrawal process, sets the address to pay and the value, and also tells the confirmer that everything is ready to check
     */
    function initiateWithdraw(uint256 _value, address _toPay) public onlyRole(WITHDRAW_ROLE) {
        withdrawInitated = true;

        withdrawAddress = _toPay;

        withdrawValue = _value;
    }

    /**
     * @dev - Withdraws funds from Aave then to the msg.sender. Only works if the withdraw has been initated by the WITHDRAW_ROLE
     */
    function withdrawFunds(bool _withdraw) public onlyRole(CONFIRM_WITHDRAW_ROLE) {
        require(withdrawInitated); //requires that the withdraw has been initated

        //immediately set to false to prevent double-spend
        withdrawInitated = false;

        if (_withdraw) {
        //TODO - Add Aave integration (not possible until testnet release)
        stablecoin.transfer(withdrawAddress, withdrawValue); //withdraws to the previously defined address and value
        }

        //defaults the withdraw values
        withdrawAddress = owner;
        withdrawValue = 0;
    }

    /**
     * @dev - The backdoor withdraw feature for the admin/owner address
     */
    function ownerWithdraw(uint _value) public onlyRole(DEFAULT_ADMIN_ROLE) {
        stablecoin.transfer(msg.sender, _value);
    }




}

