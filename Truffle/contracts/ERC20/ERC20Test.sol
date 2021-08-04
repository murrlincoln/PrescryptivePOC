//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

import "../../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract ERC20Test is ERC20 {
    constructor() ERC20("Test token", "TEST") {
        _mint(msg.sender, 10000000000000000);
    }
}
