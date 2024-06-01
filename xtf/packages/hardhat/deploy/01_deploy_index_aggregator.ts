import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { IndexAggregator, MockUniswapV3Factory, MockUniswapV3Pool, TaggingVerifier } from "../typechain-types";
import { networks } from "../scripts/networks";
// import { SubscriptionManager, SecretsManager, Location } from "@chainlink/functions-toolkit";
// import { JsonRpcProvider } from "@ethersproject/providers";
// import { Wallet } from "@ethersproject/wallet";
import * as markets from "../../../../coingecko/market.json";
import * as category from "../../../../coingecko/category.json";
import fs from "fs";
import path, { parse } from "path";
import { BigNumber } from "@ethersproject/bignumber";
import { Mock } from "node:test";
import { parseEther } from "ethers";
const feeTier = 500;

const categoryObject = new Map<string, any[]>();

const tokenDetails = new Map<string, any>();

const tokenInfo = [] as any[];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const sleepTime = 10000;
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

    await deploy("MockUSDC", {
      from: deployer,
      args: [],
      log: true,
    });
    await deploy("MockUniswapV3Factory", {
      from: deployer,
      log: true,
    });
    const mockUSDC = await hre.ethers.getContract("MockUSDC");
    const mockUniswapV3Factory = (await hre.ethers.getContract("MockUniswapV3Factory")) as MockUniswapV3Factory;

    await deploy("LiquidityManager", {
      from: deployer,
      args: [await mockUniswapV3Factory.getAddress(), [await mockUSDC.getAddress()]],
      log: true,
    });
    const liquidityManager = await hre.ethers.getContract("LiquidityManager");

    const marketArray = Object.values(markets);
    // id == governance
    let categoryArray = Object.values(category);

    categoryArray = [categoryArray.find(c => c.id === "governance") as any];

    console.log("category", categoryArray);

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
        const length = 12; //categoryDataJSON.length;

        for (let j = 0; j < length; j++) {
          const market = categoryDataJSON[j];
          const symbol = market?.symbol;
          const priceObject = marketArray.find(m => m.symbol === symbol);
          if (priceObject !== undefined) {
            categoryObject.get(categoryID)?.push(symbol);
            if (tokenDetails.get(symbol) === undefined) {
              const decimals = 10;
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

              const minLiquidity = priceObject.total_volume * 0.05;
              const maxLiquidity = priceObject.total_volume * 0.3;
              const liquidity = Math.floor(Math.random() * (maxLiquidity - minLiquidity + 1) + minLiquidity);

              await deploy("MockUniswapV3Pool", {
                from: deployer,
                args: [
                  await simpleERC20.getAddress(),
                  await mockUSDC.getAddress(),
                  feeTier,
                  BigNumber.from(liquidity).toString(),
                ],
                log: true,
              });

              const pool = await hre.ethers.getContract("MockUniswapV3Pool");

              await sleep(sleepTime);
              console.log("Sleeping Finished");

              await mockUniswapV3Factory.setPool(
                await simpleERC20.getAddress(),
                await mockUSDC.getAddress(),
                feeTier,
                await pool.getAddress(),
              );

              console.log("Pool Set");
              await sleep(sleepTime);

              tokenInfo.push({
                _symbol: priceObject.symbol,
                _address: await simpleERC20.getAddress(),
                _chainId: sepoliaChainId,
                _aggregator: await mockAggregator.getAddress(),
                _tags: [categoryID],
              });
            } else {
              tokenInfo.find(token => token._symbol === symbol)?._tags.push(categoryID);
            }
          }
        }
      } catch (e) {
        console.log(e);
      }
    }

    // print on a file all the arguments of the index aggregator called args.json
    const sepoliaToChaido = "0x3E842E3A79A00AFdd03B52390B1caC6306Ea257E";
    const providerHash = ["0x9db032812994aabd3f3d25635ab22336a699bf3cf9b9ef84e547bbd8f7d0ae25"];

    await deploy("TaggingVerifier", {
      from: deployer,
      args: [providerHash],
      log: true,
    });

    const taggingVerifier = (await hre.ethers.getContract("TaggingVerifier")) as TaggingVerifier;

    await deploy("IndexAggregator", {
      from: deployer,
      args: [
        tokenInfo,
        await liquidityManager.getAddress(),
        sepoliaToChaido,
        {
          _timeWindow: 60,
          _sampleSize: 30,
          bribeUnit: parseEther("0.05"),
        },
      ],
      log: true,
    });

    const indexAggregator = (await hre.ethers.getContract("IndexAggregator")) as IndexAggregator;
    await indexAggregator.setTaggingVerifier(await taggingVerifier.getAddress());

    for (let i = 0; i < categoryArray.length; i++) {
      console.log(categoryArray[i]?.id, categoryObject.get(categoryArray[i]?.id)?.length);
    }

    fs.writeFileSync(
      path.resolve(__dirname, "../args.json"),
      // remove later the categoryArray
      JSON.stringify([tokenInfo, 60, 5, await liquidityManager.getAddress(), categoryArray], null, 2),
    );

    // verify the contract on etherscan
    await hre.run("verify:verify", {
      address: await indexAggregator.getAddress(),
      constructorArguments: [tokenInfo, 60, 5, await liquidityManager.getAddress()],
    });
  }
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["decentralised"];
