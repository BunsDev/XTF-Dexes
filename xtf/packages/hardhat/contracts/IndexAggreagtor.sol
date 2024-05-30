// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {LiquidityManager} from "./LiquidityManager.sol";

struct TokenInfo {
    string _symbol;
    address _address;
    uint32 _chainId;
    address _aggregator;
    string[] _tags;
}


contract IndexAggregator {
    TokenInfo[] public tokenInfo;
    TokenInfo[] tmpTokens;
    LiquidityManager public liquidityManager;
    mapping(string => uint256) public tokens;
    string[] public tokenSymbols;
    uint256[] public totalSupplies;
    mapping(uint256 => uint256[]) public movingAverage;
    uint256 sampleSize;
    uint256 timeWindow;
    uint256 samplingFrequency;
    uint256 lastSampleTime;
    uint256[] public lastIndexOrder;
    mapping(string => uint256[]) public tagsIndexOrder; 
    mapping(string => uint256) public tagsIndexTimestamp;
    uint256 public lastIndexTimestamp;
    uint256 public bribeUnit;

    constructor(TokenInfo[] memory _tokenInfo, uint256 _timeWindow, uint256 _sampleSize, address _liquidityManager) {
        sampleSize = _sampleSize;
        timeWindow = _timeWindow;
        samplingFrequency = timeWindow / sampleSize;
        liquidityManager = LiquidityManager(_liquidityManager);
        for (uint256 i = 0; i < _tokenInfo.length; i++) {
            tokenInfo.push(_tokenInfo[i]);
            tokenSymbols.push(_tokenInfo[i]._symbol);
            tokens[_tokenInfo[i]._symbol] = i;
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

    function persistIndex(uint256[] memory indexOrders, string memory tag) public returns (bool)
    {
        // indexOrders is an array index order [2,0,1] means 2nd token, 0th token, 1st token for price calculation
        if(keccak256(abi.encodePacked(tag)) != keccak256(abi.encodePacked(""))) {
            for (uint256 i = 0; i < tmpTokens.length; i++) {
                delete tmpTokens[i];
            }

            for (uint256 i = 0; i < tokenInfo.length; i++) {
                for (uint256 j = 0; j < tokenInfo[i]._tags.length; j++) {
                    if (keccak256(abi.encodePacked(tokenInfo[i]._tags[j])) == keccak256(abi.encodePacked(tag))) {
                        tmpTokens.push(tokenInfo[i]);
                    }
                }
            }
            require(
                tmpTokens.length == indexOrders.length,  "IndexAggregator: Invalid length of token with required tags");
        }
        else{
           require(indexOrders.length == tokenInfo.length, "IndexAggregator: Invalid length of indexOrders");
        }



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

        if(keccak256(abi.encodePacked(tag)) != keccak256(abi.encodePacked(""))) {
           tagsIndexOrder[tag] = indexOrders;
        }
        else{
            lastIndexOrder = indexOrders;
            lastIndexTimestamp = block.timestamp;  
        }
        return true;
    }
}