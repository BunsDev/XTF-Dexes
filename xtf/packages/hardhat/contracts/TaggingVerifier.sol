// SPDX-License-Identifier: MIT
// pragma solidity 0.8.20;
pragma solidity 0.8.4;

import "@reclaimprotocol/verifier-solidity-sdk/contracts/Reclaim.sol";
import "@reclaimprotocol/verifier-solidity-sdk/contracts/Addresses.sol";
 
contract TaggingVerifier {
  address public reclaimAddress;
  // add providersHashes for your permitted providers
  string[] public providersHashes;
  mapping(string => address) public tokenSymbolToAddress;
  mapping(string => string[]) public tokenSymbolToVerifiedTags;
  mapping (string => mapping(string => bool)) public tokenSymbolToVerifiedTagsMap;
  uint256 public lastUpdateTimestamp;

  constructor(string[] memory _providersHashes){
     providersHashes = _providersHashes;
     reclaimAddress = Addresses.PLOYGON_MUMBAI_TESTNET; 
  }

  function setTokenAddress(string memory tokenSymbol, address tokenAddress) public 
  // onlyOwner
  {
    tokenSymbolToAddress[tokenSymbol] = tokenAddress;
  }

  function split(string memory str) public pure returns (string[] memory) {
        bytes memory strBytes = bytes(str);
        uint256 count = 1;
        for (uint256 i = 0; i < strBytes.length; i++) {
            if (strBytes[i] == ",") {
                count++;
            }
        }
        string[] memory result = new string[](count);
        uint256 j = 0;
        bytes memory temp;
        for (uint256 i = 0; i < strBytes.length; i++) {
            if (strBytes[i] == ",") {
                result[j] = string(temp);
                j++;
                temp = "";
            } else {
                temp = abi.encodePacked(temp, strBytes[i]);
            }
        }

        result[j] = string(temp);
        return result;
    }

  function verifyProof(Reclaim.Proof memory proof, string memory tokenSymbolTag) public {
      Reclaim(reclaimAddress).verifyProof(proof);
      require(keccak256(abi.encodePacked(proof.claimInfo.parameters)) == keccak256(abi.encodePacked(tokenSymbolTag)), "Invalid token list parameters");
      string[] memory stringList = split(tokenSymbolTag);    
      require(stringList.length == 2, "Invalid token list parameters");
      if (tokenSymbolToVerifiedTags[stringList[0]].length == 0) {
          tokenSymbolToVerifiedTags[stringList[0]] = new string[](0);
      }
      tokenSymbolToVerifiedTags[stringList[0]].push(stringList[1]);
      tokenSymbolToVerifiedTagsMap[stringList[0]][stringList[1]] = true;
      lastUpdateTimestamp = block.timestamp;
  }
}
