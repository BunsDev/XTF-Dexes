// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {LiquidityManager} from "./LiquidityManager.sol";
import {TaggingVerifier} from "./TaggingVerifier.sol";

uint32 constant CALLBACK_GAS_LIMIT = 4_000_000;

struct ChainLinkData {
    address router;
    address link;
    uint64 currentChainSelectorId;
    bytes32 keyHash;
}

struct TokenInfo {
    string _symbol;
    address _address;
    uint32 _chainId;
    address _aggregator;
    string[] _tags;
}

struct LiquidityMessage {
    address token;
    uint256 liquidity;
    uint32 chainId;
    uint256 timestamp;
} 

struct SupplyMessage {
    address token;
    uint256 supply;
    uint32 chainId;
    uint256 timestamp;
}

struct AggregatorParams {
    uint256 _timeWindow; 
    uint256 _sampleSize;
    // uint32 _chainId;3
    uint256 _bribeUnit;
}

struct IndexUpdateMessage {
    LiquidityMessage[] liquidityMessages;
    SupplyMessage[] supplyMessages;
}

enum PayFeesIn {
    Native,
    LINK
}

error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees);


contract IndexAggregator is CCIPReceiver {
    TokenInfo[] public tokenInfo;
    TokenInfo[] tmpTokens;
    LiquidityManager public liquidityManager;
    mapping(string => uint256) public tokens;
    string[] public tokenSymbols;

    
    LiquidityMessage[] public liquidityMessages;
    SupplyMessage[] public supplyMessages;
    TaggingVerifier public taggingVerifier;

    uint256[] public totalSupplies;
    uint256[] public liquidities;
    uint256[] public tokenParamsTimestampUpdates;

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
    uint32 public chainId;
    uint32 public mainChainId;

    ChainLinkData public chainLinkData;

    mapping(uint64 => address) public chainSelectorIdToSidechainAddress;


    constructor(TokenInfo[] memory _tokenInfo,  address _liquidityManager, address  router, AggregatorParams memory _aggregatorParams
    ) CCIPReceiver(router) {
        sampleSize = _aggregatorParams._sampleSize;
        timeWindow = _aggregatorParams._timeWindow;
        samplingFrequency = timeWindow / sampleSize;
        bribeUnit = _aggregatorParams._bribeUnit;
        liquidityManager = LiquidityManager(_liquidityManager);
        for (uint256 i = 0; i < _tokenInfo.length; i++) {
            tokenInfo.push(_tokenInfo[i]);
            tokenSymbols.push(_tokenInfo[i]._symbol);
            tokens[_tokenInfo[i]._symbol] = i;
            totalSupplies.push(IERC20(_tokenInfo[i]._address).totalSupply());
        }
    }

    // Initialize methods

    function setTaggingVerifier(address _taggingVerifier) external {
        taggingVerifier = TaggingVerifier(_taggingVerifier);
    }

    function setChainLinkData(
        address _router,
        address _link,
        uint64 _currentChainSelectorId,
        bytes32 _keyHash
    ) external {
        chainLinkData = ChainLinkData({
            router: _router,
            link: _link,
            currentChainSelectorId: _currentChainSelectorId,
            keyHash: _keyHash
        });
    }

    function setChainId(uint32 _chainId, uint32 _mainChainId) external {
        chainId = _chainId;
        mainChainId = _mainChainId;
    }

    // END Initialize methods


    function isMainChain() public view returns (bool) {
        return chainId == mainChainId;
    }

    function setSideChainAddress(
        uint64 chainSelectorId,
        address sideChainAddress
    ) external {
        chainSelectorIdToSidechainAddress[chainSelectorId] = sideChainAddress;
    }

    function updateTokenParams(uint256[] memory _totalSupplies, uint256[] memory _liquidities) external {

        for (uint256 i = 0; i < tokenInfo.length; i++) {
            if (tokenInfo[i]._chainId == chainId) {
                liquidities[i] = liquidityManager.getTotalLiquidityForToken(tokenInfo[i]._address);
                totalSupplies[i] = IERC20(tokenInfo[i]._address).totalSupply();
                tokenParamsTimestampUpdates[i] = block.timestamp;
            }
        }

        if(isMainChain()){
            for (uint256 i = 0; i < totalSupplies.length; i++) {
                for (uint256 j = 0; j < tokenInfo.length; j++) {
                    if (tokenInfo[j]._address == supplyMessages[i].token) {
                        totalSupplies[j] = supplyMessages[i].supply;
                        tokenParamsTimestampUpdates[j] = liquidityMessages[i].timestamp;
                    }
                    continue;
                }
            }

            for (uint256 i = 0; i < liquidities.length; i++) {
                for (uint256 j = 0; j < tokenInfo.length; j++) {
                    if (tokenInfo[j]._address == liquidityMessages[i].token) {
                        liquidities[j] = liquidityMessages[i].liquidity;
                        tokenParamsTimestampUpdates[j] = liquidityMessages[i].timestamp;
                    }
                    continue;
                }
            }
        }

        if(!isMainChain()){
            SupplyMessage[] memory _supplyMessages = new SupplyMessage[](tokenInfo.length);
            LiquidityMessage[] memory _liquidityMessages = new LiquidityMessage[](tokenInfo.length);
            for (uint256 i = 0; i < tokenInfo.length; i++) {
                if(chainId == tokenInfo[i]._chainId){
                    _supplyMessages[i] = SupplyMessage(tokenInfo[i]._address, _totalSupplies[i], chainId, block.timestamp);
                    _liquidityMessages[i] = LiquidityMessage(tokenInfo[i]._address, _liquidities[i], chainId, block.timestamp);
                }
            }
        }
    }


    function checkTokenParams() public {
        for (uint256 i = 0; i < tokenInfo.length; i++) {
            if (block.timestamp - tokenParamsTimestampUpdates[i] >= timeWindow) {
                liquidities[i] = liquidityManager.getTotalLiquidityForToken(tokenInfo[i]._address);
                totalSupplies[i] = IERC20(tokenInfo[i]._address).totalSupply();
                tokenParamsTimestampUpdates[i] = block.timestamp;
            }
        }
    }


    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal virtual override {

        IndexUpdateMessage memory indexMessage = abi.decode(
            message.data,
            (IndexUpdateMessage)
        );
        for (uint256 i = 0; i < indexMessage.liquidityMessages.length; i++) {
            LiquidityMessage memory liquidityMessage = indexMessage.liquidityMessages[i];
            liquidityMessages.push(liquidityMessage);
        }
        for (uint256 i = 0; i < indexMessage.supplyMessages.length; i++) {
            SupplyMessage memory supplyMessage = indexMessage.supplyMessages[i];
            supplyMessages.push(supplyMessage);
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
            // Clean the temporary array in the future we may use transient storage for this)
            for (uint256 i = 0; i < tmpTokens.length; i++) {
                delete tmpTokens[i];
            }

            for (uint256 i = 0; i < tokenInfo.length; i++) {
                for (uint256 j = 0; j < tokenInfo[i]._tags.length; j++) {
                    if (keccak256(abi.encodePacked(tokenInfo[i]._tags[j])) == keccak256(abi.encodePacked(tag))) {
                        // need to check if the tag was verified on the tagging system
                        require(
                            taggingVerifier.tokenSymbolToVerifiedTagsMap(tokenInfo[i]._symbol, tag) == true,
                            "IndexAggregator: Tag not verified"
                        );
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


    function supportsInterface(
        bytes4 interfaceId
    )
        public
        pure
        override(CCIPReceiver)
        returns (bool)
    {
        return CCIPReceiver.supportsInterface(interfaceId);
    }

    function send(
        uint64 destinationChainSelector,
        PayFeesIn payFeesIn,
        IndexUpdateMessage memory data
    ) internal returns (bytes32 messageId) {
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(
                chainSelectorIdToSidechainAddress[destinationChainSelector]
            ),
            data: abi.encode(data),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({
                    gasLimit: CALLBACK_GAS_LIMIT
                })
            ),
            feeToken: payFeesIn == PayFeesIn.LINK
                ? chainLinkData.link
                : address(0)
        });

        uint256 fee = IRouterClient(chainLinkData.router).getFee(
            destinationChainSelector,
            message
        );

        if (payFeesIn == PayFeesIn.LINK) {
            if (fee > IERC20(chainLinkData.link).balanceOf(address(this)))
                revert NotEnoughBalance(
                    IERC20(chainLinkData.link).balanceOf(address(this)),
                    fee
                );
            IERC20(chainLinkData.link).approve(chainLinkData.router, fee);
            messageId = IRouterClient(chainLinkData.router).ccipSend(
                destinationChainSelector,
                message
            );
        } else {
            if (fee > address(this).balance)
                revert NotEnoughBalance(address(this).balance, fee);
            messageId = IRouterClient(chainLinkData.router).ccipSend{
                value: fee
            }(destinationChainSelector, message);
        }
    }
}