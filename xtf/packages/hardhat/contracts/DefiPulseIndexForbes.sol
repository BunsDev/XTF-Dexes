
// Attestor.sol

// SPDX-License-Identifier: MIT
// pragma solidity 0.8.20;
pragma solidity 0.8.4;

 
 
import "@reclaimprotocol/verifier-solidity-sdk/contracts/Reclaim.sol";
import "@reclaimprotocol/verifier-solidity-sdk/contracts/Addresses.sol";
 
contract Attestor {
  address public reclaimAddress;
  // add providersHashes for your permitted providers
  string[] public providersHashes;
  mapping(string => address) public tokenSymbolToAddress;
  uint256 public lastUpdateTimestamp;
  string[] public defiPulseIndexForbes;


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

  function verifyProof(Reclaim.Proof memory proof, string memory tokenListParamsString) public {
      Reclaim(reclaimAddress).verifyProof(proof);
      require(keccak256(abi.encodePacked(proof.claimInfo.parameters)) == keccak256(abi.encodePacked(tokenListParamsString)), "Invalid token list parameters");

      // parse the token List string into a list of strings
      string[] memory tokenList = split(tokenListParamsString);

      for(uint i = 0; i < tokenList.length; i++){
        require(tokenSymbolToAddress[tokenList[i]] != address(0), "Token not yet registered");
        defiPulseIndexForbes.push(tokenList[i]);
      }
      lastUpdateTimestamp = block.timestamp;
  }
}