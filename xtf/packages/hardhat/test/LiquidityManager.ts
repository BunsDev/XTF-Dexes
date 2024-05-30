import { ethers } from "hardhat";
import { LiquidityManager, MockUniswapV3Factory, MockUniswapV3Pool, SimpleERC20 } from "../typechain-types";
import { BigNumber } from "@ethersproject/bignumber";
// import { defaultAbiCoder } from "@ethersproject/abi";

describe("Liquidity Manager", function () {
  let liquidityManager: LiquidityManager;
  let mockUniswapV3Factory: MockUniswapV3Factory;
  let token0: SimpleERC20;
  let token1: SimpleERC20;
  let mockUSDC: SimpleERC20;
  let mockPool: MockUniswapV3Pool;
  const feeTier = 500;
  const liquidity = BigNumber.from(1000).toString();

  before(async () => {
    // const [owner] = await ethers.getSigners();
    const mockUniswapV3FactoryFactory = await ethers.getContractFactory("MockUniswapV3Factory");
    const liquidityManagerFactory = await ethers.getContractFactory("LiquidityManager");
    const simpleERC20Factory = await ethers.getContractFactory("SimpleERC20");
    const mockUniswapV3PoolFactory = await ethers.getContractFactory("MockUniswapV3Pool");

    mockUSDC = (await simpleERC20Factory.deploy("USDC", "USDC", 6)) as SimpleERC20;
    token0 = (await simpleERC20Factory.deploy("Token0", "TOK0", 0)) as SimpleERC20;
    token1 = (await simpleERC20Factory.deploy("Token1", "TOK1", 0)) as SimpleERC20;
    mockUniswapV3Factory = (await mockUniswapV3FactoryFactory.deploy()) as MockUniswapV3Factory;
    liquidityManager = (await liquidityManagerFactory.deploy(await mockUniswapV3Factory.getAddress(), [
      await mockUSDC.getAddress(),
    ])) as LiquidityManager;
    mockPool = (await mockUniswapV3PoolFactory.deploy(
      await token0.getAddress(),
      await token1.getAddress(),
      feeTier,
      liquidity,
    )) as MockUniswapV3Pool;
    mockUniswapV3Factory.setPool(
      await token0.getAddress(),
      await mockUSDC.getAddress(),
      feeTier,
      await mockPool.getAddress(),
    );
  });

  describe("Deployment", function () {
    it("Liquidity Manager should get the liquidity from uniswapV3", async function () {
      const pools = await liquidityManager.getPoolsForToken(await token0.getAddress());
      console.log("pools", pools);
      const res = await liquidityManager.getTotalLiquidityForToken(await token0.getAddress());
      console.log("res", res.toString());
    });
  });
});
