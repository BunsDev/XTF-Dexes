// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;


import { ISP } from "@ethsign/sign-protocol-evm/src/interfaces/ISP.sol";
import { Attestation } from "@ethsign/sign-protocol-evm/src/models/Attestation.sol";
import { DataLocation } from "@ethsign/sign-protocol-evm/src/models/DataLocation.sol";

contract AttestationEntities {
    ISP public spInstance;
    uint64 public schemaId;
    uint64 public lastAttestationId;
    uint256 public lastAttestationTimestamp;
    address[] public trustedEntities;
    TokenInfo[] public proposedTokens;
    address[] public signatures;
    

    struct TokenInfo {
    string _symbol;
    address _address;
    uint32 _chainId;
    address _aggregator;
    string[] _tags;
    }

    constructor(ISP _spInstance, uint64 _schemaId, address[] memory _trustedEntities) {
        spInstance = _spInstance;
        schemaId = _schemaId;
        trustedEntities = _trustedEntities;
    }

    function proposeTokens(TokenInfo[] memory tokens) public {
        bool inTrustedEntities = false;
        for (uint i = 0; i < trustedEntities.length; i++) {
            if (msg.sender == trustedEntities[i]) {
                inTrustedEntities = true;
                break;
            }
        }
        require(inTrustedEntities, "Only trusted entities can propose tokens");
        // clear proposed tokens
        for (uint i = 0; i < proposedTokens.length; i++) {
            delete proposedTokens[i];
        }

        for (uint i = 0; i < tokens.length; i++) {
            proposedTokens.push(tokens[i]);
        }
        signatures.push(msg.sender);
    }

    function approveTokens() public {
        bool inTrustedEntities = false;
        for (uint i = 0; i < trustedEntities.length; i++) {
            if (msg.sender == trustedEntities[i]) {
                inTrustedEntities = true;
                break;
            }
        }
        require(inTrustedEntities, "Only trusted entities can approve tokens");
        signatures.push(msg.sender);
    }


    function publishListofTokens(TokenInfo[] memory _tokens) public returns (uint64) {
        require(signatures.length == trustedEntities.length, "All trusted entities must approve tokens");
        Attestation memory attestation = Attestation({
            schemaId: schemaId,
            linkedAttestationId: 0,
            attestTimestamp: uint64(block.timestamp),
            revokeTimestamp: 0,
            attester: address(this),
            validUntil: 0,
            dataLocation: DataLocation.ONCHAIN,
            revoked: false,
            recipients: new bytes[](0),
            data: abi.encode(_tokens)
        });

        lastAttestationId =  spInstance.attest(attestation, "", "", "");
        lastAttestationTimestamp = block.timestamp;
        return lastAttestationId;
    }
}




