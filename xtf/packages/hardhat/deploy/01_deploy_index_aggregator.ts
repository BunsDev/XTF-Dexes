import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { IndexCentralisedData } from "../typechain-types";
import { networks } from "../scripts/networks";
import { SubscriptionManager, SecretsManager, Location } from "@chainlink/functions-toolkit";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import * as markets from "../../../../coingecko/market.json";
import * as category from "../../../../coingecko/category.json";
import fs from "fs";
import path from "path";
import { BigNumber } from "@ethersproject/bignumber";

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
    const network = networks["ethereumSepolia"];
    const sepoliaChainId = 11155111;

    // await deploy("MockAggregator", {
    //   from: deployer,
    //   args: [100, 8],
    //   log: true,
    // });

    // tokenInfo.push({
    //   _symbol: await simpleERC20.symbol(),
    //   _address: await simpleERC20.getAddress(),
    //   _chainId: chainId,
    //   _aggregator: await mockAggregator.getAddress(),
    // });

    const marketArray = Object.values(markets);
    const categoryArray = Object.values(category);
    // .slice(0, 1);

    for (let i = 0; i < categoryArray.length; i++) {
      const category = categoryArray[i];
      const categoryID = category?.id;

      // load the file at `../../../../coingecko/categories/${categoryID}.json`
      // and parse it]

      if (categoryID !== undefined) {
        categoryObject.set(categoryID, []);
      }

      try {
        const categoryData = await fs.readFileSync(
          path.resolve(__dirname, `../../../../coingecko/categories/${categoryID}.json`),
          "utf8",
        );

        const categoryDataJSON = JSON.parse(categoryData);
        for (let j = 0; j < categoryDataJSON.length; j++) {
          const market = categoryDataJSON[j];
          const symbol = market?.symbol;
          const priceObject = marketArray.find(m => m.symbol === symbol);
          if (priceObject !== undefined) {
            categoryObject.get(categoryID)?.push(symbol);
            if (tokenDetails.get(symbol) === undefined) {
              const decimals = 8;
              const circulatingSupply = BigNumber.from(String(priceObject.circulating_supply).replace(".", "")).mul(
                BigNumber.from("10").pow(
                  decimals - (String(priceObject.circulating_supply).split(".")[1]?.length || 0),
                ),
              );
              console.log("PRICEEE", circulatingSupply);

              tokenDetails.set(symbol, priceObject);
              console.log(symbol, priceObject.current_price, priceObject.circulating_supply, priceObject.name);
              await deploy("SimpleERC20", {
                from: deployer,
                args: [priceObject.name, priceObject.symbol, circulatingSupply],
                log: true,
              });

              const currentPrice = BigNumber.from(String(priceObject.current_price).replace(".", "")).mul(
                BigNumber.from("10").pow(decimals - (String(priceObject.current_price).split(".")[1]?.length || 0)),
              );

              await deploy("MockAggregator", {
                from: deployer,
                args: [currentPrice, decimals],
                log: true,
              });

              const simpleERC20 = await hre.ethers.getContract("SimpleERC20");
              const mockAggregator = await hre.ethers.getContract("MockAggregator");

              tokenInfo.push({
                _symbol: priceObject.symbol,
                _address: await simpleERC20.getAddress(),
                _chainId: sepoliaChainId,
                _aggregator: await mockAggregator.getAddress(),
              });
            }
          }
        }
      } catch (e) {
        console.log(e);
      }
    }

    await deploy("IndexAggregator", {
      from: deployer,
      args: [tokenInfo, 60, 5],
      log: true,
    });

    for (let i = 0; i < categoryArray.length; i++) {
      console.log(categoryArray[i]?.id, categoryObject.get(categoryArray[i]?.id)?.length);
    }
  }
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["decentralised"];
