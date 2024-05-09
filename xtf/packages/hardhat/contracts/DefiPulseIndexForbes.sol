
// Attestor.sol

// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;
 
 
import "@reclaimprotocol/verifier-solidity-sdk/contracts/Reclaim.sol";
import "@reclaimprotocol/verifier-solidity-sdk/contracts/Addresses.sol";
 
contract Attestor {
  address public reclaimAddress;
  // add providersHashes for your permitted providers
  string[] public providersHashes;

  constructor(string[] memory _providersHashes){
     providersHashes = _providersHashes;
       // TODO: Replace with network you are deploying on
     reclaimAddress = Addresses.PLOYGON_MUMBAI_TESTNET; 

  }  

  function verifyProof(Reclaim.Proof memory proof) public view{
      Reclaim(reclaimAddress).verifyProof(proof, providersHashes);
      // TODO: your business logic upon success
      // verify proof.context is what you expect
  }
}

// refer this example for more details - 
// https://github.com/reclaimprotocol/verifier-sdk-example/blob/main/contracts/Attestor.sol
