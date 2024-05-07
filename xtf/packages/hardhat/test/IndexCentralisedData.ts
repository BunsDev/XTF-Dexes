import { ethers } from "hardhat";
import { IndexCentralisedData } from "../typechain-types";
import { BigNumber } from "@ethersproject/bignumber";
import { defaultAbiCoder } from "@ethersproject/abi";

describe("IndexCentralisedData", function () {
  let indexAggregator: IndexCentralisedData;

  before(async () => {
    const [owner] = await ethers.getSigners();
    const indexCentralisedData = await ethers.getContractFactory("IndexCentralisedData");
    const donId = "fun-ethereum-mainnet-1";
    const routerAddress = "0x65Dcc24F8ff9e51F10DCc7Ed1e4e2A61e6E14bd6";
    const donIdBytes32 = ethers.encodeBytes32String(donId);

    indexAggregator = await indexCentralisedData.deploy(routerAddress, donIdBytes32);
  });

  describe("Deployment", function () {
    it("Should send request to the function consumer", async function () {});
  });
});
