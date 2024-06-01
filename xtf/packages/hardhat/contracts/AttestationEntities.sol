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
    address[] public approvedAddresses;
    uint64[] public weights;
    

    struct TokenInfo {
    string _name;
    string _symbol;
    address _address;
    uint32 _chainId;
    }

    constructor(ISP _spInstance, uint64 _schemaId, address[] memory _trustedEntities) {
        spInstance = _spInstance;
        schemaId = _schemaId;
        trustedEntities = _trustedEntities;
    }

    function setTrustedEntities(address[] memory _trustedEntities) public {
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
        bool hasAlreadyApproved = false;
        for (uint i = 0; i < trustedEntities.length; i++) {
            if (msg.sender == trustedEntities[i]) {
                inTrustedEntities = true;
                break;
            }
        }

        require(inTrustedEntities, "Only trusted entities can approve tokens");

        // for (uint i = 0; i < signatures.length; i++) {
        //     if (msg.sender == signatures[i]) {
        //         hasAlreadyApproved = true;
        //         break;
        //     }
        // }

        // require(!hasAlreadyApproved, "You have already approved the tokens");

        signatures.push(msg.sender);
    }


    function publishListofTokens(uint256[] memory _weights) public returns (uint64) {
        // require(signatures.length == trustedEntities.length, "All trusted entities must approve tokens");
        
        for (uint256 i = 0; i < proposedTokens.length; i++) {
            approvedAddresses.push(proposedTokens[i]._address);
        }
        
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
            data: abi.encode(
                approvedAddresses,
                _weights
            )
        });

        lastAttestationId =  spInstance.attest(attestation, "", "", "");
        lastAttestationTimestamp = block.timestamp;
        return lastAttestationId;
    }
}




