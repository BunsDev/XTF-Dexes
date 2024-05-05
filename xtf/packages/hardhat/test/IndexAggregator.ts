import { expect } from "chai";
import { ethers } from "hardhat";
import { IndexAggregator, SimpleERC20, MockAggregator } from "../typechain-types";
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

  before(async () => {
    const [owner] = await ethers.getSigners();
    const simpleERC20Factory = await ethers.getContractFactory("SimpleERC20");
    const mockAggregatorFactory = await ethers.getContractFactory("MockAggregator");
    const indexAggregatorFactory = await ethers.getContractFactory("IndexAggregator");

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
      const price = BigNumber.from(priceValue).mul(BigNumber.from("10").pow(decimalsPrice));
      const mockAggregator = (await mockAggregatorFactory.deploy(price.toString(), decimalsPrice)) as MockAggregator;

      tokenInfo.push({
        _symbol: await simpleERC20.symbol(),
        _address: await simpleERC20.getAddress(),
        _chainId: chainId,
        _aggregator: await mockAggregator.getAddress(),
      });
    }

    indexAggregator = (await indexAggregatorFactory.deploy(tokenInfo, timeWindow, sampleSize)) as IndexAggregator;
  });

  describe("Deployment", function () {
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
  });
});
