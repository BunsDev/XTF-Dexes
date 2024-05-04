import React from "react";
import { sepolia, useAccount, useContractWrite } from "wagmi";
import { getAllContracts } from "~~/utils/scaffold-eth/contractsData";

const xrpledgerchainId = 1440002;
const sepoliaChainId = 11155111;

export function DepositButton({
  bundleId,
  state,
  tokenAddressA,
  quantityTokenA,
  tokenAddressB,
  quantityTokenB,
  tokenAddressC,
  quantityTokenC,
}: {
  bundleId: string;
  state: any;
  tokenAddressA: any;
  quantityTokenA: any;
  tokenAddressB: any;
  quantityTokenB: any;
  tokenAddressC: any;
  quantityTokenC: any;
}) {
  const contractsData = getAllContracts();
  const { address: connectedAddress } = useAccount();

  const {
    data: burn,
    isLoading: isburnLoading,
    writeAsync: burnAsync,
  } = useContractWrite({
    address: contractsData["ETFIssuingChain"].address,
    functionName: "burn",
    abi: contractsData["ETFIssuingChain"].abi,
    args: [bundleId],
  });

  const contractName = "ETFIssuingChain";
  const {
    data: deposit,
    isLoading: isdepLoading,
    writeAsync: depositAsync,
  } = useContractWrite({
    address: contractsData[contractName].address,
    functionName: "deposit",
    abi: contractsData[contractName].abi,
    args: [
      {
        vaultId: bundleId,
        tokens: [
          {
            _address: tokenAddressA,
            _quantity: quantityTokenA,
            _chainId: xrpledgerchainId,
            _contributor: connectedAddress,
            _aggregator: contractsData["MockAggregator"].address,
          },
          {
            _address: tokenAddressB,
            _quantity: quantityTokenB,
            _chainId: xrpledgerchainId,
            _contributor: connectedAddress,
            _aggregator: contractsData["MockAggregator"].address,
          },
        ],
      },
    ],
  });

  const {
    data: replayMessag,
    isLoading: isReplayLoading,
    writeAsync: replayMessageAsync,
  } = useContractWrite({
    address: contractsData[contractName].address,
    functionName: "deposit",
    abi: contractsData[contractName].abi,
    args: [
      {
        vaultId: bundleId,
        tokens: [
          {
            _address: tokenAddressA,
            _quantity: 0,
            _chainId: xrpledgerchainId,
            _contributor: connectedAddress,
            _aggregator: contractsData["MockAggregator"].address,
          },
          {
            _address: tokenAddressB,
            _quantity: 0,
            _chainId: xrpledgerchainId,
            _contributor: connectedAddress,
            _aggregator: contractsData["MockAggregator"].address,
          },
          {
            _address: tokenAddressC,
            _quantity: quantityTokenC,
            _chainId: sepoliaChainId,
            _contributor: connectedAddress,
            _aggregator: contractsData["MockAggregator"].address,
          },
        ],
      },
    ],
  });

  return state < 2 ? (
    <>
      <button
        className="bg-green-500 hover:bg-green-700 text-white size font-bold py-2 px-6 rounded-full"
        style={{
          marginLeft: "4%",
          marginRight: "4%",
          cursor: "pointer",
          fontSize: "18px",
        }}
        onClick={async () => {
          await depositAsync();
          // sleep for 2 seconds
          await new Promise(r => setTimeout(r, 6000));
          window.location.reload();
        }}
        disabled={isdepLoading}
      >
        Deposit
      </button>
      <br></br>
      <hr></hr>
      <br></br>

      {["42", "27", "12", "65", "7", "18", "71"].includes(bundleId.toString()) && (
        <button
          className="bg-orange-500 hover:bg-orange-700 text-white size font-bold py-2 px-6 rounded-full"
          style={{
            marginLeft: "4%",
            marginRight: "4%",
            cursor: "pointer",
            fontSize: "18px",
          }}
          onClick={async () => {
            await replayMessageAsync();
            // sleep for 2 seconds
            await new Promise(r => setTimeout(r, 6000));
            window.location.reload();
          }}
          disabled={isdepLoading}
        >
          Fetch and Replay Messages
        </button>
      )}
    </>
  ) : state == 2 ? (
    <button
      //   className="bg-green-500 hover:bg-green-700 text-white size font-bold py-2 px-6 rounded-full"
      className="bg-red-500 hover:bg-red-700 text-white size font-bold py-2 px-6 rounded-full"
      style={{
        marginLeft: "4%",
        marginRight: "4%",
        cursor: "pointer",
        fontSize: "18px",
      }}
      disabled={isburnLoading}
      onClick={async () => {
        await burnAsync();
        // reload the page
        await new Promise(r => setTimeout(r, 4000));

        window.location.reload();
      }}
    >
      Burn
    </button>
  ) : (
    <p>Burned</p>
  );
}
