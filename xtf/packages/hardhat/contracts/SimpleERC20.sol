// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

interface ISimpleERC20 is IERC20 {
    function mint(address to, uint256 amount) external;
    function burn(address sender, uint256 amount) external;
}

contract SimpleERC20 is ISimpleERC20, ERC20 {
    address public owner = msg.sender;

	constructor(
		string memory name,
		string memory symbol,
		uint256 initialSupply
	) ERC20(name, symbol) {
		_mint(msg.sender, initialSupply);
	}

    function setOwner(address _owner) public {
        require(msg.sender == owner, "SimpleERC20: only owner can change owner");
        owner = _owner;
    }

    function mint(address to, uint256 amount) public {
        require(msg.sender == owner, "SimpleERC20: only owner can mint");
        _mint(to, amount);
    }

    function burn(address sender, uint256 amount) public {
        _burn(sender, amount);
    }

}
