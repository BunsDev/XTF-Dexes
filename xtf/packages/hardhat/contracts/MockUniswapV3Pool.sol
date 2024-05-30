pragma solidity ^0.8.0;

import "./IUniswapV3Pool.sol";

contract MockUniswapV3Pool is IUniswapV3Pool {

    address _token0;
    address _token1;
    uint128 _liquidity;
    uint24 _fee;

    constructor(
        address t0,
        address t1,
        uint24 f,
        uint128 l
    ) {
        _token0 = t0;
        _token1 = t1;
        _fee = f;
        _liquidity = l;
    }

    function setLiquidity(uint128 l) external {
        _liquidity = l;
    }

	function liquidity() external view override returns (uint128) {
        return _liquidity;
    }

	function token0() external view override returns (address) {}

	function token1() external view override returns (address) {}
}
