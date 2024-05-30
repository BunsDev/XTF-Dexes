pragma solidity ^0.8.0;

import "./IUniswapV3Factory.sol";
import "./IUniswapV3Pool.sol";


contract MockUniswapV3Factory is IUniswapV3Factory {

    address _owner;
    mapping(address => mapping(address => mapping(uint24 => address))) public _pools;

    constructor() {
        _owner = msg.sender;
    }

	function getPool(
		address tokenA,
		address tokenB,
		uint24 fee
	) external view override returns (address) {
		return _pools[tokenA][tokenB][fee];
	}

	function setPool(
		address tokenA,
		address tokenB,
		uint24 fee,
		address pool
	) external {
		_pools[tokenA][tokenB][fee] = pool;
	}

	function owner() external view override returns (address) {
        return _owner;
    }

	function feeAmountTickSpacing(
		uint24 fee
	) external view override returns (int24) {
        return 0;
    }

	function createPool(
		address tokenA,
		address tokenB,
		uint24 fee
	) external override returns (address pool) {}

	function setOwner(address _owner) external override {}

	function enableFeeAmount(uint24 fee, int24 tickSpacing) external override {}
}