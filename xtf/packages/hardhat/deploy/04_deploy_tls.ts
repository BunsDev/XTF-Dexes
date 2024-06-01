import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { TLSIndexNotary } from "../typechain-types";
import { networks } from "../scripts/networks";
import { SubscriptionManager, SecretsManager, Location } from "@chainlink/functions-toolkit";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { BigNumber } from "@ethersproject/bignumber";

const proof = {
  identifier: "0xbdf83fd1b3c7a05bb515db87f178a1feb9d820af08d8994ae919a863b19b996d",
  claimData: {
    provider: "http",
    parameters:
      '{"body":"","geoLocation":"","method":"GET","paramValues":{"aave":"Aave","balancer":"Balancer","compound":"Compound","lido":"Lido DAO","maker":"Maker","synthetix":"Synthetix","uniswap":"Uniswap","weth":"WETH","yearn":"yearn-finance"},"responseMatches":[{"type":"contains","value":"\\"name\\":\\"{{uniswap}}\\""},{"type":"contains","value":"\\"name\\":\\"{{maker}}\\""},{"type":"contains","value":"\\"name\\":\\"{{lido}}\\""},{"type":"contains","value":"\\"name\\":\\"{{aave}}\\""},{"type":"contains","value":"\\"name\\":\\"{{synthetix}} Network\\""},{"type":"contains","value":"\\"symbol\\":\\"{{yearn}}\\""},{"type":"contains","value":"\\"name\\":\\"{{balancer}}\\""},{"type":"contains","value":"\\"name\\":\\"{{weth}}\\""},{"type":"contains","value":"\\"name\\":\\"{{compound}}\\""}],"responseRedactions":[{"jsonPath":"$.assets[0].name","regex":"\\"name\\":\\"(.*)\\"","xPath":""},{"jsonPath":"$.assets[1].name","regex":"\\"name\\":\\"(.*)\\"","xPath":""},{"jsonPath":"$.assets[2].name","regex":"\\"name\\":\\"(.*)\\"","xPath":""},{"jsonPath":"$.assets[3].name","regex":"\\"name\\":\\"(.*)\\"","xPath":""},{"jsonPath":"$.assets[4].name","regex":"\\"name\\":\\"(.*) Network\\"","xPath":""},{"jsonPath":"$.assets[7].symbol","regex":"\\"symbol\\":\\"(.*)\\"","xPath":""},{"jsonPath":"$.assets[8].name","regex":"\\"name\\":\\"(.*)\\"","xPath":""},{"jsonPath":"$.assets[9].name","regex":"\\"name\\":\\"(.*)\\"","xPath":""},{"jsonPath":"$.assets[6].name","regex":"\\"name\\":\\"(.*)\\"","xPath":""}],"url":"https://fda.forbes.com/v2/tradedAssets?limit=100&pageNum=1&sortBy=marketCap&direction=desc&query=&category=ftCategory&categoryId=defi-pulse-index-dpi"}',
    owner: "0x8f266e3f86925c8eed4f6e22c35052212e31735a",
    timestampS: 1715263484,
    context:
      '{"extractedParameters":{"aave":"Aave","balancer":"Balancer","compound":"Compound","lido":"Lido DAO","maker":"Maker","synthetix":"Synthetix","uniswap":"Uniswap","weth":"WETH","yearn":"yearn-finance"},"providerHash":"0x9db032812994aabd3f3d25635ab22336a699bf3cf9b9ef84e547bbd8f7d0ae25"}',
    identifier: "0xbdf83fd1b3c7a05bb515db87f178a1feb9d820af08d8994ae919a863b19b996d",
    epoch: 1,
  },
  signatures: [
    "0xde497f6713ca78c797ac585ad9b449cef8635ed52a66c70019efd8728705296260503f72501a2c86c476ae07bbd47df3328d81dfc465e6fde23970a689a6efb91b",
  ],
  witnesses: [
    {
      id: "0x244897572368eadf65bfbc5aec98d8e5443a9072",
      url: "https://reclaim-node.questbook.app",
    },
  ],
};

// const deployed = [
//   '0x55AeA97404A80e58bd8A18908E43d0c769F785Af',
//   '0xbbe836fA4D4802BC4355119CF11EceA68D2ca1F2',
//   '0x6d83efC65821552aD3E18c0Af2772c8d527aBF5D',
//   '0x0579Ea19210ACd66Bce84c61887BF9faF11D37a5',
//   '0x3439Ef6cEb8F3Da10BcBFB6E6D1Ce186A16E14fd',
//   '0x13410F80361f4C745D426Cfd439D126A13532921',
//   '0xd2BF59918bA3FdD13D6eb0ec90832622aD7dEe9d',
//   '0x5b82DC69f9626f141fA8d5890Ac0C0b65eE626e0',
//   '0x867198E4cAecfD20b91Ee72F7B25d53bFF1faBc1'
// ];

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
    console.log("Deploying AttestationEntities contract to Sepolia network");
    // const network = networks["ethereumSepolia"];
    // const sepoliaChainId = 11155111;
    const providerHash = ["0x9db032812994aabd3f3d25635ab22336a699bf3cf9b9ef84e547bbd8f7d0ae25"];

    const erc20Tokens = [];

    await deploy("TLSIndexNotary", {
      from: deployer,
      args: [providerHash],
      log: true,
    });
    const tlsIndexNotary = (await hre.ethers.getContract("TLSIndexNotary")) as TLSIndexNotary;
    const tokensString = "maker,uniswap,lido,aave,synthetix,yearn,balancer,weth,compound";
    const tokensList = tokensString.split(",");
    for (let i = 0; i < tokensList.length; i++) {
      await deploy("SimpleERC20", {
        from: deployer,
        args: [tokensList[i], tokensList[i], 0],
        log: true,
      });
      const simpleERC20 = await hre.ethers.getContract("SimpleERC20");
      erc20Tokens.push(await simpleERC20.getAddress());
    }
    console.log("ERC20 tokens deployed", erc20Tokens);

    for (let i = 0; i < erc20Tokens.length; i++) {
      await tlsIndexNotary.setTokenAddress(tokensList[i], await erc20Tokens[i]);
    }

    const proofClaim = {
      claimInfo: {
        provider: proof.claimData.provider,
        parameters: proof.claimData.parameters,
        context: proof.claimData.context,
      },

      signedClaim: {
        claim: {
          identifier: proof.identifier,
          owner: proof.claimData.owner,
          timestampS: proof.claimData.timestampS,
          epoch: proof.claimData.epoch,
        },
        signatures: proof.signatures,
      },
    };

    await tlsIndexNotary.verifyProof(proofClaim, tokensString);
    console.log("AttestationEntities contract deployed to Sepolia network");
  }
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["tlsoracle"];
