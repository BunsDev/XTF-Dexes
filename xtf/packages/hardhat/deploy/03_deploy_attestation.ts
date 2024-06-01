import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { AttestationEntities } from "../typechain-types";
import { networks } from "../scripts/networks";
import { SubscriptionManager, SecretsManager, Location } from "@chainlink/functions-toolkit";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import * as markets from "../../../../coingecko/market.json";
import * as category from "../../../../coingecko/category.json";
import fs from "fs";
import path from "path";
import { BigNumber } from "@ethersproject/bignumber";
import { Mock } from "node:test";
const feeTier = 500;

const categoryObject = new Map<string, any[]>();

const tokenDetails = new Map<string, any>();

const tokenInfo = [] as any[];

// import { config } from "@chainlink/env-enc";
/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  if (hre.network.name === "sepolia") {
    console.log("Deploying AttestationEntities contract to Sepolia network");
    const network = networks["ethereumSepolia"];
    const sepoliaChainId = 11155111;
    const weight = 1;

    const addressBookSepolia = "0x878c92fd89d8e0b93dc0a3c907a2adc7577e39c5";
    // const schemaId = "onchain_evm_11155111_0x5f";
    const schemaId = "0x5f";

    const trustedEntities = [
      "0x2a1f5eb3e84e58e6f1e565306298b9de1273f203",
      "0x2a1f5eb3e84e58e6f1e565306298b9de1273f203",
    ];

    const TokenName = ["Uniswap", "Maker", "Aave", "Synthetix", "Compound"];
    const TokenSymbol = ["UNI", "MKR", "AAVE", "SNX", "COMP"];

    for (let i = 0; i < TokenName.length; i++) {
      await deploy("SimpleERC20", {
        from: deployer,
        args: [TokenName[i], TokenSymbol[i], 18],
        log: true,
      });
      const simpleERC20 = await hre.ethers.getContract("SimpleERC20");
      tokenInfo.push({
        _name: TokenName[i],
        _symbol: TokenSymbol[i],
        _address: await simpleERC20.getAddress(),
        _chainId: sepoliaChainId,
      });
    }

    await deploy("AttestationEntities", {
      from: deployer,
      args: [addressBookSepolia, schemaId, trustedEntities],
      log: true,
    });

    const attestationEntities = (await hre.ethers.getContract("AttestationEntities")) as AttestationEntities;

    await attestationEntities.proposeTokens(tokenInfo);

    await attestationEntities.approveTokens();
    await attestationEntities.approveTokens();

    await attestationEntities.publishListofTokens([1, 1, 1, 1, 1]);
    console.log("AttestationEntities contract deployed to Sepolia network");
  }
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["attestation"];
