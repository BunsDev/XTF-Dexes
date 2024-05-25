import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { IndexAggregator, IndexCentralisedData } from "../typechain-types";
import { networks } from "../scripts/networks";
import { SubscriptionManager, SecretsManager, Location } from "@chainlink/functions-toolkit";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
// import * as markets from "../../../../coingecko/market.json";
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

    // const marketArray = Object.values(markets);
    // const categoryArray = Object.values(category).slice(0, 1);

    // get the markets hitting the coingecko API https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd
    // and save it in markets object

    const example = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd");

    const markets = await example.json();

    // console.log("mm\n", markets);

    const indexCentralisedData = await hre.ethers.getContract<IndexAggregator>("IndexAggregator");

    const symbolNumber = 10;
    const decimals = 8;

    for (let i = 0; i < symbolNumber; i++) {
      const [symbol, tokenAddress, chainId, priceAggregator] = await indexCentralisedData.tokenInfo(i);
      // console.log("symbol", symbol, "tokenAddress", tokenAddress, "chainId", chainId, "priceAggregator", priceAggregator);
      // get contract MockAggregator at priceAggregator address
      const mockAggregator = await hre.ethers.getContractAt("MockAggregator", priceAggregator);

      // get the price of the token by matching the symbol with the markets object
      const price = markets.find((market: any) => market.symbol === symbol)?.current_price;

      const currentPrice = BigNumber.from(String(price).replace(".", "")).mul(
        BigNumber.from("10").pow(decimals - (String(price).split(".")[1]?.length || 0)),
      );

      console.log("price for", symbol, "found", currentPrice.toString(), "at", await mockAggregator.getAddress());

      // set the price in the MockAggregator contract
      // await mockAggregator.setPrice(currentPrice.toString());

      // await mockAggregator.setPrice(100);
    }

    // for (let i = 0; i < categoryArray.length; i++) {
    //   const category = categoryArray[i];
    //   const categoryID = category?.id;

    //   // load the file at `../../../../coingecko/categories/${categoryID}.json`
    //   // and parse it]

    //   if (categoryID !== undefined) {
    //     categoryObject.set(categoryID, []);
    //   }

    //   try {
    //     const categoryData = await fs.readFileSync(
    //       path.resolve(__dirname, `../../../../coingecko/categories/${categoryID}.json`),
    //       "utf8",
    //     );

    //     const categoryDataJSON = JSON.parse(categoryData);
    //     for (let j = 0; j < categoryDataJSON.length; j++) {
    //       const market = categoryDataJSON[j];
    //       const symbol = market?.symbol;
    //       const priceObject = marketArray.find(m => m.symbol === symbol);
    //       if (priceObject !== undefined) {
    //         categoryObject.get(categoryID)?.push(symbol);
    //         if (tokenDetails.get(symbol) === undefined) {
    //           const decimals = 8;
    //           const circulatingSupply = BigNumber.from(String(priceObject.circulating_supply).replace(".", "")).mul(
    //             BigNumber.from("10").pow(
    //               decimals - (String(priceObject.circulating_supply).split(".")[1]?.length || 0),
    //             ),
    //           );
    //           console.log("PRICEEE", circulatingSupply);

    //           tokenDetails.set(symbol, priceObject);
    //           console.log(symbol, priceObject.current_price, priceObject.circulating_supply, priceObject.name);
    //           await deploy("SimpleERC20", {
    //             from: deployer,
    //             args: [priceObject.name, priceObject.symbol, circulatingSupply],
    //             log: true,
    //           });

    //           const currentPrice = BigNumber.from(String(priceObject.current_price).replace(".", "")).mul(
    //             BigNumber.from("10").pow(decimals - (String(priceObject.current_price).split(".")[1]?.length || 0)),
    //           );

    //           await deploy("MockAggregator", {
    //             from: deployer,
    //             args: [currentPrice, decimals],
    //             log: true,
    //           });

    //           const simpleERC20 = await hre.ethers.getContract("SimpleERC20");
    //           const mockAggregator = await hre.ethers.getContract("MockAggregator");

    //           tokenInfo.push({
    //             _symbol: priceObject.symbol,
    //             _address: await simpleERC20.getAddress(),
    //             _chainId: sepoliaChainId,
    //             _aggregator: await mockAggregator.getAddress(),
    //           });
    //         }
    //       }
    //     }
    //   } catch (e) {
    //     console.log(e);
    //   }
    // }
  }
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["update_prices"];
