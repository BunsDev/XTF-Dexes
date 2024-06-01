// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;


import { ISP } from "@ethsign/sign-protocol-evm/src/interfaces/ISP.sol";
import { Attestation } from "@ethsign/sign-protocol-evm/src/models/Attestation.sol";
import { DataLocation } from "@ethsign/sign-protocol-evm/src/models/DataLocation.sol";

contract TrustedEntity {
    ISP public spInstance;
    uint64 public schemaId;
    uint64 public lastAttestationId;
    uint256 public lastAttestationTimestamp;

    struct TokenInfo {
    string _symbol;
    address _address;
    uint32 _chainId;
    address _aggregator;
    string[] _tags;
    }

    constructor(ISP _spInstance, uint64 _schemaId) {
        spInstance = _spInstance;
        schemaId = _schemaId;
    }


    function publishListofTokens(TokenInfo[] memory _tokens) public returns (uint64) {
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




