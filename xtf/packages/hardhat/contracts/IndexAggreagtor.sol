pragma solidity ^0.8.0;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

struct TokenInfo {
    string _symbol;
    address _address;
    uint32 _chainId;
    address _aggregator;
}


contract IndexAggregator {
    TokenInfo[] public tokenInfo;
    mapping(uint256 => uint256) public totalSupply;
    mapping(uint256 => uint256[]) public movingAverage;
    uint256 sampleSize;
    uint256 timeWindow;
    uint256 samplingFrequency;
    uint256 lastSampleTime;
    uint256[] public lastIndex; 
    uint256 public lastIndexTimestamp;

    constructor(TokenInfo[] memory _tokenInfo, uint256 _timeWindow, uint256 _sampleSize) {
        tokenInfo = _tokenInfo;
        sampleSize = _sampleSize;
        timeWindow = _timeWindow;
        samplingFrequency = timeWindow / sampleSize;
        
    }

    function collectPriceFeeds() external {

        require(block.timestamp - lastSampleTime >= samplingFrequency, "IndexAggregator: Sampling frequency not reached");

        if (block.timestamp - lastSampleTime >= timeWindow) {
            for (uint256 i = 0; i < tokenInfo.length; i++) {
                movingAverage[i].pop();
            }
        }

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
    }

    function calculateIndex(uint256[] memory indexOrders) public returns (bool)
    {
        // indexOrders is an array index order [2,0,1] means 2nd token, 0th token, 1st token for price calculation
        uint256 token_a_value;
        uint256 token_b_value;
        for (uint256 i = 0; i < indexOrders.length - 1; i++) {
            token_a_value =  0;

            if(i == 0) {
                token_b_value = 0;
                for (uint256 j = 0; j < movingAverage[indexOrders[i]].length; j++) {
                    token_a_value += movingAverage[indexOrders[i]][j] * totalSupply[indexOrders[i]];
                    token_b_value += movingAverage[indexOrders[i + 1]][j] * totalSupply[indexOrders[i + 1]];
                }
            } else
            {
                for (uint256 j = 0; j < movingAverage[indexOrders[i]].length; j++) {
                    token_a_value += movingAverage[indexOrders[i]][j] * totalSupply[indexOrders[i]];
                }
            }

            require(token_a_value > 0, "IndexAggregator: Token value is zero");
            require(token_b_value > 0, "IndexAggregator: Token value is zero");
            require(token_b_value > token_a_value, "IndexAggregator: order is not correct");
        }

        lastIndex = indexOrders;
        lastIndexTimestamp = block.timestamp;
        return true;
    }



}