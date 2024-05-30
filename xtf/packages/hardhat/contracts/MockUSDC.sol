// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "./SimpleERC20.sol";

contract MockUSDC is SimpleERC20 {
    constructor() SimpleERC20("USDC", "USDC", 100000000000000000000000000) {}
}