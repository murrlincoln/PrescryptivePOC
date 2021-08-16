// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;
import "../../node_modules/@openzeppelin/contracts/access/AccessControl.sol"; //allows for different roles to be created
import "../../node_modules/@aave/protocol-v2/contracts/protocol/lendingpool/LendingPool.sol";


contract PrescryptiveSmartContract is AccessControl {
    //Role used for adding a withdrawer
    bytes32 public constant WITHDRAW_ROLE = keccak256("WITHDRAW_ROLE");

    //Role for the financial team who will confirm or deny tx
    bytes32 public constant CONFIRM_WITHDRAW_ROLE =
        keccak256("CONFIRM_WITHDRAW_ROLE");

    address erc20Contract; //the contract for the token/stablecoin

    bool private withdrawInitated; //tells if the withdraw has been initated or not
    uint256 public withdrawValue; //the value of the withdrawal
    address public withdrawAddress; //the address of the withdrawal
    address public owner; //DEFAULT_ADMIN_ROLE address

    address public pool = 0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe; //The Aave Smart Contract Pool (currently set to DAI on Kovan)

    LendingPool private stablecoinPool = LendingPool(pool); //the lending pool

    constructor(address _erc20) public {
        //make the sender (the payer) both the admin and have withdraw rights
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(WITHDRAW_ROLE, msg.sender);
        _setupRole(CONFIRM_WITHDRAW_ROLE, msg.sender);
        owner = msg.sender;

        //add the interaction interface with the token
        // stablecoin = ERC20(_erc20);
        erc20Contract = _erc20;
    }

    //depending on setup of the smart contract, the withdraw role may be unnecessary,
    //if there is only one entity who should have access

    /**
     * @dev - Changes the owner to a new address
     */
    function changeOwner(address _newOwner)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        grantRole(DEFAULT_ADMIN_ROLE, _newOwner);
        grantRole(WITHDRAW_ROLE, _newOwner);
        grantRole(CONFIRM_WITHDRAW_ROLE, _newOwner);

        revokeRole(DEFAULT_ADMIN_ROLE, owner);
        revokeRole(WITHDRAW_ROLE, owner);
        revokeRole(CONFIRM_WITHDRAW_ROLE, owner);
        
        owner = _newOwner;
    }

    /**
     * @dev Adds another withdrawer role to the smart contract, which can withdraw funds and do nothing else
     */
    function addWithdrawer(address _newWithdrawer) public {
        grantRole(WITHDRAW_ROLE, _newWithdrawer);
    }
    
    /**
     * @dev removes the confirmer role from an address, meaning they can no longer confirm withdraw of funds
     */
    function removeWithdrawer(address _withdrawer) public {
        revokeRole(CONFIRM_WITHDRAW_ROLE, _withdrawer);
    }

    //Should this be callable by WITHDRAW_ROLE, or require admin?
    /**
     * @dev Adds another confirmer role to the smart contract, which can confirm withdraw of funds and do nothing else
     */
    function addConfirmer(address _newConfirmer) public {
        grantRole(CONFIRM_WITHDRAW_ROLE, _newConfirmer);
    }

    /**
     * @dev removes the withdraw role from an address, meaning they can no longer withdraw funds
     */
    function removeConfirmer(address _confirmer) public {
        revokeRole(CONFIRM_WITHDRAW_ROLE, _confirmer);
    }

    /**
     * @dev - The first step in the withdrawal process, sets the address to pay and the value, and also tells the confirmer that everything is ready to check
     */
    function initiateWithdraw(uint256 _value, address _toPay)
        public
        onlyRole(WITHDRAW_ROLE)
    {
        withdrawInitated = true;

        withdrawAddress = _toPay;

        withdrawValue = _value;
    }

    /**
     * @dev - Cancels the withdraw and resets all variables. Would be used in the case of a typo from the initial withdrawer
     */
    function cancelWithdraw() public onlyRole(CONFIRM_WITHDRAW_ROLE) {
        withdrawInitated = false;
        withdrawAddress = owner;
        withdrawValue = 0;
    }

    /**
     * @dev - Withdraws funds from Aave then to the msg.sender. Only works if the withdraw has been initated by the WITHDRAW_ROLE. Double confirms the value and toPay to ensure that no malicious
     * WITHDRAW_ROLE could change the address and value mid-execution
     */
    function withdrawFunds(
        bool _withdraw,
        uint256 _value,
        address _toPay
    ) public onlyRole(CONFIRM_WITHDRAW_ROLE) {
        require(withdrawInitated); //requires that the withdraw has been initated
        require(_value == withdrawValue && _toPay == withdrawAddress); //Ensures that the value and payment are the same, giving double-check on payment confirmation

        //immediately set to defaults to follow checks-effects-interactions
        withdrawInitated = false;
        withdrawAddress = owner;
        withdrawValue = 0;

        if (_withdraw) {

            stablecoinPool.withdraw(erc20Contract, _value, _toPay);

        }
    }

    /**
     * @dev - The backdoor withdraw feature for the admin/owner address
     */
    function ownerWithdraw(uint256 _value) public onlyRole(DEFAULT_ADMIN_ROLE) {
        
        stablecoinPool.withdraw(erc20Contract, _value, msg.sender);

    }
}
