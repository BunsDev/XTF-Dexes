// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ISimpleERC20 } from "./SimpleERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "hardhat/console.sol";

struct TokenQuantity {
	address _address;
	uint256 _quantity;
	uint32 _chainId;
	address _contributor;
	address _aggregator;
}

struct Vault {
	TokenQuantity[] _tokens;
	VaultState state;
}

enum VaultState {
	EMPTY,
	OPEN,
	MINTED,
	BURNED
}

struct EventInfo {
	address sender;
	uint256 quantity;
	uint32 chainId;
	address contributor;
}

struct DepositInfo {
	uint256 vaultId;
	TokenQuantity[] tokens;
}

contract ETFIssuingChain {
	address public sideChainLock;
	TokenQuantity[] public requiredTokens;
	mapping(address => TokenQuantity) public addressToToken;
	uint32 public chainId;
	address public etfToken;
	uint256 public etfTokenPerVault;

	mapping(uint256 => address[]) contributorsByVault;
	mapping(uint256 => mapping(address => uint256))
		public accountContributionsPerVault;

	event Deposit(
		uint256 _vaultId,
		address _address,
		uint256 _quantity,
		uint32 _chainId,
		address _contributor
	);

	mapping(uint256 => Vault) public vaults;

	constructor(
		uint32 _chainId,
		TokenQuantity[] memory _requiredTokens,
		address _etfToken,
		uint256 _etfTokenPerVault
	) {
		chainId = _chainId;
		etfToken = _etfToken;
		etfTokenPerVault = _etfTokenPerVault;
		for (uint256 i = 0; i < _requiredTokens.length; i++) {
			requiredTokens.push(_requiredTokens[i]);
			addressToToken[_requiredTokens[i]._address] = _requiredTokens[i];
		}
	}

	function getVaultStates() public view returns (VaultState[] memory) {
		VaultState[] memory states = new VaultState[](90);
		for (uint256 i = 0; i < states.length; i++) {
			states[i] = vaults[i].state;
		}
		return states;
	}

	function getVault(uint256 _vaultId) public view returns (Vault memory) {
		return vaults[_vaultId];
	}

	function getRequiredTokens() public view returns (TokenQuantity[] memory) {
		return requiredTokens;
	}

	function setVaultState(uint256 _vaultId, VaultState _state) public {
		vaults[_vaultId].state = _state;
	}

	function _deposit(
		DepositInfo memory _depositInfo,
		uint32 _chainId
	) internal {
		uint256 _vaultId = _depositInfo.vaultId;
		TokenQuantity[] memory _tokens = _depositInfo.tokens;
		require(
			vaults[_vaultId].state == VaultState.OPEN ||
				vaults[_vaultId].state == VaultState.EMPTY,
			"Vault is not open or empty"
		);

		// require(_chainId == chainId, "ChainId does not match the contract chainId")

		if (vaults[_vaultId].state == VaultState.EMPTY) {
			for (uint256 i = 0; i < requiredTokens.length; i++) {
				vaults[_vaultId]._tokens.push(
					TokenQuantity(
						requiredTokens[i]._address,
						0,
						requiredTokens[i]._chainId,
						address(0),
						requiredTokens[i]._aggregator
					)
				);
			}
			vaults[_vaultId].state = VaultState.OPEN;
		}

		for (uint256 i = 0; i < _tokens.length; i++) {
			// if (_tokens[i]._chainId != _chainId) {
			// 	revert(
			// 		"Token chainId does not match the chainId of the contract"
			// 	);
			// }
			console.log(
				"Token address: %s",
				_tokens[i]._address,
				i,
				vaults[_vaultId]._tokens.length
			);
			if (
				_tokens[i]._quantity + vaults[_vaultId]._tokens[i]._quantity >
				addressToToken[_tokens[i]._address]._quantity
			) {
				revert("Token quantity exceeds the required amount");
			}

			if (_tokens[i]._chainId == _chainId) {
				IERC20(_tokens[i]._address).transferFrom(
					_tokens[i]._contributor,
					address(this),
					_tokens[i]._quantity
				);
			}

			vaults[_vaultId]._tokens[i]._quantity += _tokens[i]._quantity;

			emit Deposit(
				_vaultId,
				_tokens[i]._address,
				_tokens[i]._quantity,
				_tokens[i]._chainId,
				_tokens[i]._contributor
			);

			if (accountContributionsPerVault[_vaultId][msg.sender] == 0) {
				contributorsByVault[_vaultId].push(msg.sender);
			}

			// uint256 price = AggregatorV3Interface(_tokens[i]._aggretator).latestRoundData().answer;

			// (, /* uint80 roundID */ int answer, , , ) = AggregatorV3Interface(
			// 	_tokens[i]._aggregator
			// ).latestRoundData();

			accountContributionsPerVault[_vaultId][msg.sender] += _tokens[i]
				._quantity;
		}

		for (uint256 i = 0; i < requiredTokens.length; i++) {
			if (
				vaults[_vaultId]._tokens[i]._quantity <
				requiredTokens[i]._quantity
			) {
				return;
			}
		}
		vaults[_vaultId].state = VaultState.MINTED;
		distributeShares(_vaultId);
	}

	function distributeShares(uint256 _vaultId) internal {
		uint256 totalContributions = 0;
		for (uint256 i = 0; i < contributorsByVault[_vaultId].length; i++) {
			totalContributions += accountContributionsPerVault[_vaultId][
				contributorsByVault[_vaultId][i]
			];
		}

		for (uint256 i = 0; i < contributorsByVault[_vaultId].length; i++) {
			uint256 shares = (accountContributionsPerVault[_vaultId][
				contributorsByVault[_vaultId][i]
			] * etfTokenPerVault) / totalContributions;
			ISimpleERC20(etfToken).mint(
				contributorsByVault[_vaultId][i],
				shares
			);
		}
	}

	function deposit(DepositInfo memory _depositInfo) public {
		_deposit(_depositInfo, chainId);
	}

	function handle(
		uint32 _origin,
		bytes32 _sender,
		bytes calldata _message
	) external payable {
		require(
			bytes32ToAddress(_sender) == sideChainLock,
			"Sender is not the sideChainLock"
		);

		DepositInfo memory _depositInfo = abi.decode(_message, (DepositInfo));
		uint32 _chainId = _depositInfo.tokens[0]._chainId;
		_deposit(_depositInfo, _chainId);
	}

	function burn(uint256 _vaultId) public {
		require(
			vaults[_vaultId].state == VaultState.MINTED,
			"Vault is not minted"
		);
		// require to pay back the etfToken
		ISimpleERC20(etfToken).burn(msg.sender, etfTokenPerVault);
		for (uint256 j = 0; j < vaults[_vaultId]._tokens.length; j++) {
			if (vaults[_vaultId]._tokens[j]._chainId == chainId) {
				IERC20(vaults[_vaultId]._tokens[j]._address).transfer(
					msg.sender,
					vaults[_vaultId]._tokens[j]._quantity
				);
			}
		}
		vaults[_vaultId].state = VaultState.BURNED;
	}

	function addressToBytes32(address _addr) internal pure returns (bytes32) {
		return bytes32(uint256(uint160(_addr)));
	}

	function bytes32ToAddress(
		bytes32 _bytes32
	) internal pure returns (address) {
		return address(uint160(uint256(_bytes32)));
	}
}
