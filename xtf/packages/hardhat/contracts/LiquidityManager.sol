// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IUniswapV3Factory.sol";
import "./IUniswapV3Pool.sol";

contract LiquidityManager {
    IUniswapV3Factory public factory;
    uint24[] public feeTiers = [500, 3000, 10000]; // Example fee tiers: 0.05%, 0.3%, 1%
    address[] public wellKnownTokens = [
        0xC0eA2b88c6c510A5EbdafDE64366527d57C86f18, // USDC
        0xC0eA2b88c6c510A5EbdafDE64366527d57C86f18, // USDT
        0xC0eA2b88c6c510A5EbdafDE64366527d57C86f18  // WETH
    ];

    constructor(address _factory) {
        factory = IUniswapV3Factory(_factory);
    }

    function getPoolsForToken(address token) public view returns (address[] memory) {
        uint256 poolCount = 0;
        address[] memory tempPools = new address[](wellKnownTokens.length * feeTiers.length);

        for (uint256 i = 0; i < wellKnownTokens.length; i++) {
            if (wellKnownTokens[i] == token) continue;
            for (uint256 j = 0; j < feeTiers.length; j++) {
                address pool = factory.getPool(token, wellKnownTokens[i], feeTiers[j]);
                if (pool != address(0)) {
                    tempPools[poolCount] = pool;
                    poolCount++;
                }
            }
        }

        // Create an array of the actual size
        address[] memory pools = new address[](poolCount);
        for (uint256 i = 0; i < poolCount; i++) {
            pools[i] = tempPools[i];
        }

        return pools;
    }

    function getTotalLiquidityForToken(address token) public view returns (uint128 totalLiquidity) {
        address[] memory pools = getPoolsForToken(token);
        for (uint256 i = 0; i < pools.length; i++) {
            totalLiquidity += IUniswapV3Pool(pools[i]).liquidity();
        }
    }
}
