// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract MockAggregator is AggregatorV3Interface {
    int256 private price;
    // array of batch prices to fetch / pop and if empty return price
    int256[] private prices;
    uint8 private dec;

    constructor(int256 _price, uint8 _decimals) {
        price = _price;
        dec = _decimals;
    }

    function setPrice(int256 _price) external {
        price = _price;
    }

    function setPrices(int256[] memory _prices) external {
        prices = _prices;
    }

    function decimals() public view override returns (uint8) {
        return dec;
    }

    function description() external pure override returns (string memory) {
        return "Mock Aggregator";
    }

    function version() external pure override returns (uint256) {
        return 0;
    }

    function getRoundData(
        uint80 _roundId
    )
        external
        pure
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (_roundId, 0, 0, 0, 0);
    }


   function latestRoundedData()
        external
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        // if prices is empty return price otherwise pop price
        if (prices.length > 0) {
            price = prices[prices.length - 1];
            prices.pop();
        }
        return (0, price, 0, 0, 0);
    }
    

    function latestRoundData()
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        // if prices is empty return price otherwise pop price
        return (0, price, 0, 0, 0);
    }
}
