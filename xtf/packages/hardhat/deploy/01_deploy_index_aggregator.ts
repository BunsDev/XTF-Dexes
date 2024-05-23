import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { IndexCentralisedData } from "../typechain-types";
import { networks } from "../scripts/networks";
import { SubscriptionManager, SecretsManager, Location } from "@chainlink/functions-toolkit";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import fs from "fs";
import path from "path";

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

    // for testing purposes we can deploy only one price aggregator and update 

    deploy("IndexCentralisedData", {
      from: deployer,
      args: [routerAddress, donIdBytes32],
      log: true,
    });

    const IndexCentralisedDataContract = await hre.ethers.getContract<IndexCentralisedData>("IndexCentralisedData", deployer);

    await subscriptionManager.addConsumer({
      subscriptionId: subID,
      consumerAddress: await IndexCentralisedDataContract.getAddress(),
    });

    const secrets = {
      privateKey: process.env.DEPLOYER_PRIVATE_KEY || "",
      coingeckoKey: process.env.COINGECKO_API_KEY || "",
    };

    const encryptedSecretsObj = await secretsManager.encryptSecrets(secrets);

    const { version, success } = await secretsManager.uploadEncryptedSecretsToDON({
      encryptedSecretsHexstring: encryptedSecretsObj.encryptedSecrets,
      gatewayUrls,
      slotId,
      minutesUntilExpiration,
    });

    if (success) {
      console.log("\nUploaded secrets to DON...");
      const encryptedSecretsReference = secretsManager.buildDONHostedEncryptedSecretsReference({
        slotId,
        version,
      });

      console.log(`\nMake a note of the encryptedSecretsReference: ${encryptedSecretsReference} `);

      const source = fs.readFileSync(path.resolve(__dirname, "../sourceNormalise.js")).toString();

      const args = ["layer1"];
      const gasLimit = 300_000;
      const requestTx = await IndexCentralisedDataContract.sendRequest(
        source,
        Location.DONHosted,
        encryptedSecretsReference,
        args,
        [],
        subID,
        gasLimit,
      );

      const txReceipt = await requestTx.wait();
      if (txReceipt !== null) {
        const requestId = txReceipt.logs[0].topics[1];
        console.log(`\nRequest made.  Request Id is ${requestId}. TxHash is ${requestTx.hash}`);
      }
    }
  }
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["IndexCentralisedData"];
