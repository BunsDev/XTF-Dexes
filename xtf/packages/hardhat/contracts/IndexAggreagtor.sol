// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

struct TokenInfo {
    string _symbol;
    address _address;
    uint32 _chainId;
    address _aggregator;
}


contract IndexAggregator {
    TokenInfo[] public tokenInfo;
    uint256[] public totalSupplies;
    mapping(uint256 => uint256[]) public movingAverage;
    uint256 sampleSize;
    uint256 timeWindow;
    uint256 samplingFrequency;
    uint256 lastSampleTime;
    uint256[] public lastIndex; 
    uint256 public lastIndexTimestamp;
    uint256 public bribeUnit;

    constructor(TokenInfo[] memory _tokenInfo, uint256 _timeWindow, uint256 _sampleSize) {
        sampleSize = _sampleSize;
        timeWindow = _timeWindow;
        samplingFrequency = timeWindow / sampleSize;
        for (uint256 i = 0; i < _tokenInfo.length; i++) {
            tokenInfo.push(_tokenInfo[i]);
            totalSupplies.push(IERC20(_tokenInfo[i]._address).totalSupply());
        }
        
    }

    function collectPriceFeeds() external {
        require(block.timestamp - lastSampleTime >= samplingFrequency, "IndexAggregator: Sampling frequency not reached");

        // if (block.timestamp - lastSampleTime >= timeWindow) {
        //     for (uint256 i = 0; i < tokenInfo.length; i++) {
        //         if (movingAverage[i].length > 0) {
        //             movingAverage[i].pop();
        //         }
        //     }
        // }

        for (uint256 i = 0; i < tokenInfo.length; i++) {
            (, int256 answer, , , ) = AggregatorV3Interface(tokenInfo[i]._aggregator).latestRoundData();

            movingAverage[i].push(uint256(answer));
            uint256 sum = 0;
            if (movingAverage[i].length > sampleSize) {
                movingAverage[i].pop();
            }
            for (uint256 j = 0; j < movingAverage[i].length; j++) {
                sum += movingAverage[i][j];
            }
        }
        lastSampleTime = block.timestamp;
        // if there is enough bribe pay it to the caller
        if (bribeUnit > 0) {
            payable(msg.sender).transfer(bribeUnit);
        }
    }

    function persistIndex(uint256[] memory indexOrders) public returns (bool)
    {
        // indexOrders is an array index order [2,0,1] means 2nd token, 0th token, 1st token for price calculation

        require(indexOrders.length == tokenInfo.length, "IndexAggregator: Invalid length of indexOrders");

        uint256 token_a_value;
        uint256 token_b_value;
        for (uint256 i = 0; i < indexOrders.length - 1; i++) {
            token_a_value =  0;
            token_b_value = 0;

            for (uint256 j = 0; j < movingAverage[indexOrders[i]].length; j++) {
                token_a_value += movingAverage[indexOrders[i]][j] * totalSupplies[indexOrders[i]];
                token_b_value += movingAverage[indexOrders[i + 1]][j] * totalSupplies[indexOrders[i + 1]];
            }


            require(token_a_value > 0, "IndexAggregator: Token value is zero");
            require(token_b_value > 0, "IndexAggregator: Token value is zero");
            require(token_a_value > token_b_value, "IndexAggregator: order is not correct");
        }

        lastIndex = indexOrders;
        lastIndexTimestamp = block.timestamp;
        return true;
    }
}