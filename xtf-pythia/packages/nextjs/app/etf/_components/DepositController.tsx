"use client";

import React from "react";
import { useContractWrite } from "wagmi";
import { displayTxResult } from "~~/app/debug/_components/contract";
import { useTransactor } from "~~/hooks/scaffold-eth";
// import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getAllContracts } from "~~/utils/scaffold-eth/contractsData";

export function DepositController({
  quantity,
  setQuantity,
  requiredQuantity,
  tokenAddress,
  chainId,
}: {
  quantity: any;
  requiredQuantity: any;
  setQuantity: any;
  tokenAddress: any;
  chainId: any;
}) {
  const contractsData = getAllContracts();
  const writeTxn = useTransactor();
  const contractName = "ETFIssuingChain";
  const xrpledgerchainId = 1440002;
  const contractSimpleName = "SimpleERC20";

  const {
    data: approve,
    isLoading,
    writeAsync: approveAsync,
  } = useContractWrite({
    address: tokenAddress,
    functionName: "approve",
    abi: contractsData[contractSimpleName].abi,
    args: [contractsData[contractName].address, quantity],
  });

  return (
    <div>
      {/* <button
        onClick={async () => {
          const { data } = await refetch();
          setData(data);
          console.log(data);
        }}
        disabled={isFetching}
      >
        getOwner
      </button> */}
      {/* {(isFetReq0 || isFetReq1) && <p>Loading...</p>} */}
      <>
        {/* <p>{displayTxResult(data)}</p> */}
        <div
          //   flex direction row one next to the other
          style={{
            display: "flex",
            flexDirection: "row",
            // justifyContent: "space-between",
            width: "100%",
            gap: "50px",
          }}
        >
          <div>
            <p>Address:</p>
            {displayTxResult(tokenAddress)}
          </div>
          <div>
            <p>Chain:</p>
            {displayTxResult(chainId)}
          </div>
          <div>
            <p>Required:</p>
            {displayTxResult(requiredQuantity)}
          </div>
          {chainId === xrpledgerchainId && (
            <div>
              <p>Approve token</p>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white size font-bold py-2 px-6 rounded-full"
                style={{ cursor: "pointer", fontSize: "12px" }}
                onClick={async () => {
                  if (approveAsync) {
                    try {
                      const makeWriteWithParams = () => approveAsync();
                      await writeTxn(makeWriteWithParams);
                      // onChange();
                    } catch (e: any) {
                      console.log(e);
                    }
                  }
                }}
              >
                Approve
              </button>
            </div>
          )}
          {chainId === xrpledgerchainId && (
            <div>
              <p>Quantity:</p>
              <input
                className="border border-gray-400 rounded-md"
                type="number"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
              ></input>
            </div>
          )}
          {/* {chainId === xrpledgerchainId && (
            <div>
              <p>Deposit 100 token</p>
              <button
                onClick={async () => {
                  if (depositAsync) {
                    try {
                      const makeWriteWithParams = () => depositAsync();
                      await writeTxn(makeWriteWithParams);
                      // onChange();
                    } catch (e: any) {
                      console.log(e);
                      //   notification.error(message);
                    }
                  }
                }}
              >
                Deposit
              </button>
            </div>
          )} */}
        </div>
      </>
      <br></br>
    </div>
  );
}
