import React, { useEffect, useState } from "react";
import { useAccount, useContractRead, useContractWrite } from "wagmi";
import { displayTxResult } from "~~/app/debug/_components/contract";
import { getParsedError, notification } from "~~/utils/scaffold-eth";
import { getAllContracts } from "~~/utils/scaffold-eth/contractsData";

interface TokenBalanceAllowanceProps {
  name: string;
  tokenAddress: string;
  isApprove?: boolean;
}

const TokenBalanceAllowance: React.FC<TokenBalanceAllowanceProps> = ({ name, tokenAddress, isApprove = false }) => {
  const [balance, setBalance] = useState<any>();
  const [allowance, setAllowance] = useState<any>();
  const { address: connectedAddress } = useAccount();
  const contractsData = getAllContracts();
  const contractSimpleName = "SimpleERC20";
  const contractName = "ETFIssuingChain";

  const { isFetching: isFet, refetch: fetchBalance } = useContractRead({
    address: tokenAddress,
    functionName: "balanceOf",
    abi: contractsData[contractSimpleName].abi,
    args: [connectedAddress],
    enabled: false,
    onError: (error: any) => {
      const parsedErrror = getParsedError(error);
      notification.error(parsedErrror);
    },
  });

  const {
    data: approve,
    isLoading: approveLoading,
    writeAsync: approveAsync,
  } = useContractWrite({
    address: tokenAddress,
    functionName: "approve",
    abi: contractsData[contractSimpleName].abi,
    args: [contractsData[contractName].address, balance],
  });

  const { isFetching: isFetAllow, refetch: fetchAllowance } = useContractRead({
    address: tokenAddress,
    functionName: "allowance",
    abi: contractsData[contractSimpleName].abi,
    args: [connectedAddress, contractsData[contractName].address],
    enabled: false,
    onError: (error: any) => {
      const parsedErrror = getParsedError(error);
      notification.error(parsedErrror);
    },
  });

  useEffect(() => {
    async function fetchData() {
      if (isFet || !connectedAddress) {
        return;
      }
      if (fetchBalance) {
        const { data } = await fetchBalance();
        setBalance(data);
      }
    }
    fetchData();
  }, [connectedAddress]);

  useEffect(() => {
    async function fetchData() {
      if (isFetAllow || !connectedAddress) {
        return;
      }
      if (fetchAllowance) {
        const { data } = await fetchAllowance();
        console.log("allowance", connectedAddress, contractsData[contractName].address, data);
        setAllowance(data);
      }
    }
    fetchData();
  }, [connectedAddress]);

  return (
    <div>
      <b>{name} Token Balance</b>
      {displayTxResult(balance)}
      {"  "}
      <span>(Allowance {displayTxResult(allowance)} )</span>{" "}
      {isApprove && (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white  font-bold py-1 px-1 rounded-full"
          style={{
            cursor: "pointer",
            fontSize: "12px",
          }}
          onClick={async () => {
            await approveAsync();
          }}
          disabled={approveLoading}
        >
          Approve
        </button>
      )}{" "}
      <br></br>
    </div>
  );
};

export default TokenBalanceAllowance;
