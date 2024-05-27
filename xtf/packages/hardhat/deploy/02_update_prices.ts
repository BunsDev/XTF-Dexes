import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { IndexAggregator } from "../typechain-types";
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

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

    const example = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd");

    const markets = await example.json();

    const indexAggregator = await hre.ethers.getContract<IndexAggregator>("IndexAggregator");

    const tokenNumber = 10;
    // const decimals = 8;

    // for (let i = 0; i < tokenNumber; i++) {
    //   const [symbol, tokenAddress, chainId, priceAggregator] = await indexAggregator.tokenInfo(i);
    //   // console.log("symbol", symbol, "tokenAddress", tokenAddress, "chainId", chainId, "priceAggregator", priceAggregator);
    //   // get contract MockAggregator at priceAggregator address
    //   const mockAggregator = await hre.ethers.getContractAt("MockAggregator", priceAggregator);

    //   // get the price of the token by matching the symbol with the markets object
    //   const price = markets.find((market: any) => market.symbol === symbol)?.current_price;
    //   const supply = markets.find((market: any) => market.symbol === symbol)?.circulating_supply;

    //   const currentPrice = BigNumber.from(String(price).replace(".", "")).mul(
    //     BigNumber.from("10").pow(decimals - (String(price).split(".")[1]?.length || 0)),
    //   );

    //   const circulatingSupply = BigNumber.from(String(supply).replace(".", "")).mul(
    //     BigNumber.from("10").pow(decimals - (String(supply).split(".")[1]?.length || 0)),
    //   );
    //   console.log(
    //     "price for",
    //     symbol,
    //     "found",
    //     currentPrice.toString(),
    //     "at",
    //     await mockAggregator.getAddress(),
    //     "supply",
    //     circulatingSupply.toString(),
    //   );

    // set the price in the MockAggregator contract
    // await mockAggregator.setPrice(currentPrice.toString());
    // }

    const today = new Date();
    // FORMAT DD-MM-YYYY
    for (let dayNumber = 0; dayNumber < 7; dayNumber++) {
      for (let i = 0; i < tokenNumber; i++) {
        const todayString = today.getDate() + "-" + (today.getMonth() + 1) + "-" + today.getFullYear();
        const [symbol, tokenAddress, chainId, priceAggregator] = await indexAggregator.tokenInfo(i);
        // console.log(
        //   "symbol",
        //   symbol,
        //   "tokenAddress",
        //   tokenAddress,
        //   "chainId",
        //   chainId,
        //   "priceAggregator",
        //   priceAggregator,
        // );
        // get the latest price of the token
        const mockAggregator = await hre.ethers.getContractAt("MockAggregator", priceAggregator);
        const id = markets.find((market: any) => market.symbol === symbol)?.id;
        // console.log(symbol, id, await mockAggregator.latestRoundData());
        // match the symbol with the markets object id
        const historyEndpoint = `https://api.coingecko.com/api/v3/coins/${id}/history?date=${todayString}`;
        const history = await fetch(historyEndpoint);
        const historyJSON = await history.json();
        let price = historyJSON.market_data.current_price.usd;
        const supply = historyJSON.market_data.circulating_supply;
        const decimals = 8;
        const currentDecimal = String(price).split(".")[1]?.length || 0;

        // console.log("currentDecimal", currentDecimal);

        price = String(price).replace(".", "");
        if (currentDecimal < decimals) {
          price += "0".repeat(decimals - currentDecimal);
        } else if (currentDecimal > decimals) {
          price = price.slice(0, price.length - (currentDecimal - decimals));
        }
        console.log(todayString, symbol, price);
        await mockAggregator.setPrice(price);
        await sleep(13500);
      }
      await indexAggregator.collectPriceFeeds();
      today.setDate(today.getDate() - 1);
    }
    // collect the price feeds
    // await indexAggregator.collectPriceFeeds();

    //  now sort the tokens and persist them in the contract

    // const samples = 2;
    // const tokenAverages = [] as any[];
    // // get the prices of the tokens for ordering
    // for (let i = 0; i < tokenNumber; i++) {
    //   const priceAverage = BigNumber.from(0);
    //   const supply = await indexAggregator.totalSupplies(i);
    //   for (let j = 0; j < samples; j++) {
    //     const price = await indexAggregator.movingAverage(i, j);
    //     priceAverage.add(BigNumber.from(price).mul(supply));
    //   }
    //   tokenAverages.push(priceAverage);
    // }

    // console.log(
    //   "tokenAverages",
    //   tokenAverages.map(price => price.toString()),
    // );

    // // sort the tokens descending
    // const sortedTokenIndexes = tokenAverages
    //   .map((price, index) => ({ price, index }))
    //   .sort((a, b) => (a.price.gt(b.price) ? -1 : 1))
    //   .map(({ index }) => index);
    // console.log("sorted", sortedTokenIndexes);

    // await indexAggregator.persistIndex(sortedTokenIndexes);
  }
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["update_prices"];
