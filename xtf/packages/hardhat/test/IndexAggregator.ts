import { expect } from "chai";
import { ethers } from "hardhat";
import {
  IndexAggregator,
  SimpleERC20,
  MockAggregator,
  MockUniswapV3Factory,
  LiquidityManager,
} from "../typechain-types";
import { BigNumber } from "@ethersproject/bignumber";

describe("IndexAggregator", function () {
  // We define a fixture to reuse the same setup in every test.
  const decimalsPrice = 8;
  const decimals = 18;
  const chainId = 31337;

  const timeWindow = 60;
  const sampleSize = 5;
  const tokenInfo = [] as any[];
  const tokenNumber = 3;

  let indexAggregator: IndexAggregator;
  let mockUSDC: SimpleERC20;
  let mockUniswapV3Factory: MockUniswapV3Factory;
  let liquidityManager: LiquidityManager;

  before(async () => {
    const [owner] = await ethers.getSigners();
    const simpleERC20Factory = await ethers.getContractFactory("SimpleERC20");
    const mockAggregatorFactory = await ethers.getContractFactory("MockAggregator");
    const indexAggregatorFactory = await ethers.getContractFactory("IndexAggregator");

    const mockUniswapV3FactoryFactory = await ethers.getContractFactory("MockUniswapV3Factory");
    const liquidityManagerFactory = await ethers.getContractFactory("LiquidityManager");
    mockUSDC = (await simpleERC20Factory.deploy("USDC", "USDC", 6)) as SimpleERC20;
    mockUniswapV3Factory = (await mockUniswapV3FactoryFactory.deploy()) as MockUniswapV3Factory;
    liquidityManager = (await liquidityManagerFactory.deploy(await mockUniswapV3Factory.getAddress(), [
      await mockUSDC.getAddress(),
    ])) as LiquidityManager;

    for (let i = 0; i < tokenNumber; i++) {
      const simpleERC20 = (await simpleERC20Factory.deploy("SimpleERC20", "SERC20", 0)) as SimpleERC20;
      await simpleERC20.mint(
        owner.address,
        BigNumber.from((i + 1) * 100)
          .mul(BigNumber.from("10").pow(decimals))
          .toString(),
      );
      // price random
      const priceValue = Math.floor(Math.random() * 100);
      const price = BigNumber.from(priceValue).mul(BigNumber.from("10").pow(1));
      const mockAggregator = (await mockAggregatorFactory.deploy(price.toString(), decimalsPrice)) as MockAggregator;

      tokenInfo.push({
        _symbol: await simpleERC20.symbol(),
        _address: await simpleERC20.getAddress(),
        _chainId: chainId,
        _aggregator: await mockAggregator.getAddress(),
        _tags: [],
      });
    }

    indexAggregator = (await indexAggregatorFactory.deploy(
      tokenInfo,
      timeWindow,
      sampleSize,
      await liquidityManager.getAddress(),
    )) as IndexAggregator;
  });

  describe("Deployment", function () {
    it("Should have deployed tokens and price aggregator", async function () {
      for (let i = 0; i < tokenNumber; i++) {
        // hardhat connect to SimpleERC20 at address tokenInfo[i]._address
        const token = (await ethers.getContractAt("SimpleERC20", tokenInfo[i]._address)) as SimpleERC20;
        expect(await token.symbol()).to.equal(tokenInfo[i]._symbol);
        expect(await token.totalSupply()).to.be.gt(0);
      }
    });

    it("Should have stored all token info in the contract", async function () {
      for (let i = 0; i < tokenNumber; i++) {
        expect(await indexAggregator.tokenInfo(i)).to.deep.equal([
          tokenInfo[i]._symbol,
          tokenInfo[i]._address,
          tokenInfo[i]._chainId,
          tokenInfo[i]._aggregator,
        ]);
      }
    });

    it("Should collect the price for the index", async function () {
      await indexAggregator.collectPriceFeeds();
    });

    it("Should accept the right order", async function () {
      await ethers.provider.send("evm_increaseTime", [timeWindow]);
      await indexAggregator.collectPriceFeeds();
      const totalSupplies = [];
      for (let i = 0; i < tokenNumber; i++) {
        totalSupplies.push(
          BigNumber.from(await indexAggregator.totalSupplies(i))
            .div(BigNumber.from("10").pow(decimals))
            .toNumber(),
        );
      }

      const prices = [];
      for (let i = 0; i < tokenNumber; i++) {
        // get mockAggregator at address tokenInfo[i]._aggregator
        const mockAggregator = (await ethers.getContractAt(
          "MockAggregator",
          tokenInfo[i]._aggregator,
        )) as MockAggregator;
        prices.push((await mockAggregator.latestRoundData())[1]);
      }

      const values: any[] = [];
      for (let i = 0; i < tokenNumber; i++) {
        values.push(BigNumber.from(totalSupplies[i]).mul(prices[i]));
      }

      // order the values by creating an array of indexes and sorting it
      const indexes = Array.from(Array(tokenNumber).keys());
      indexes.sort((a, b) => values[b].sub(values[a]).toNumber());

      await indexAggregator.persistIndex(indexes, "");
    });
  });
});
