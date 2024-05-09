// import { DebugContracts } from "./_components/DebugContracts";
"use client";

import { useEffect, useState } from "react";
import { DepositButton } from "./_components/DepositButton";
import { DepositController } from "./_components/DepositController";
import { MatrixView } from "./_components/MatrixView";
import PieToken from "./_components/PieToken";
import TokenBalanceAllowance from "./_components/tokenBalanceAllowance";
import "./index.css";
import { Watermark } from "antd";
import type { NextPage } from "next";
import { useAccount, useContractRead } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getParsedError, notification } from "~~/utils/scaffold-eth";
import { getAllContracts } from "~~/utils/scaffold-eth/contractsData";

const ETF: NextPage = () => {
  const contractsData = getAllContracts();
  const [bundleId, setBundleId] = useState<string>("1");
  const [bundles, setBundles] = useState<any>();
  const [vault, setVault] = useState<any>({});
  const [tokens, setTokens] = useState<any>([]);

  const [quantityTokenA, setQuantityTokenA] = useState<any>("");
  const [quantityTokenB, setQuantityTokenB] = useState<any>("");
  const [quantityTokenC, setQuantityTokenC] = useState<any>("");

  const [etfTokenAddress, setEtfTokenAddress] = useState<any>("0x106d24F579D77fbe71CBBF169f6Dc376208e25b5");

  // const [resultFee, setResultFee] = useState<any>();
  // const [txValue, setTxValue] = useState<string | bigint>("");
  const writeTxn = useTransactor();

  const { targetNetwork } = useTargetNetwork();
  const { chain} = useAccount();
  const writeDisabled = !chain || chain?.id !== targetNetwork.id;

  const contractName = "ETFIssuing";

  const { isFetching: isFetToken, refetch: tokensFetch } = useContractRead({
    address: contractsData[contractName].address,
    functionName: "getRequiredTokens",
    abi: contractsData[contractName].abi,
    args: [],
    enabled: false,
    onError: (error: any) => {
      const parsedErrror = getParsedError(error);
      console.log(parsedErrror);
    },
  });

  const { isFetching: isETFTokenAddressFetching, refetch: etfTokenAddressFetch } = useContractRead({
    address: contractsData[contractName].address,
    functionName: "etfToken",
    abi: contractsData[contractName].abi,
    args: [],
    enabled: false,
    onError: (error: any) => {
      const parsedErrror = getParsedError(error);
      console.log(parsedErrror);
    },
  });

  const { isFetching, refetch } = useContractRead({
    address: contractsData[contractName].address,
    functionName: "getVaultStates",
    abi: contractsData[contractName].abi,
    args: [],
    enabled: false,
    onError: (error: any) => {
      const parsedErrror = getParsedError(error);
      notification.error(parsedErrror);
    },
  });

  const { isFetching: isVaultFet, refetch: vaultSate } = useContractRead({
    address: contractsData[contractName].address,
    functionName: "getVault",
    abi: contractsData[contractName].abi,
    args: [bundleId],
    enabled: false,
    onError: (error: any) => {
      const parsedErrror = getParsedError(error);
      notification.error(parsedErrror);
    },
  });

  // const etfTokenAddress = "0x106d24F579D77fbe71CBBF169f6Dc376208e25b5";

  useEffect(() => {
    async function fetchData() {
      if (isFetching) {
        return;
      }
      if (refetch) {
        const { data } = await refetch();
        setBundles(data);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (isETFTokenAddressFetching) {
        return;
      }
      if (etfTokenAddressFetch) {
        const { data } = await etfTokenAddressFetch();
        setEtfTokenAddress(data);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (isVaultFet) {
        return;
      }
      if (vaultSate) {
        const { data } = await vaultSate();
        console.log("vault", data);
        setVault(data);
        // if type of data is Array, then it is a vault
      }
    }
    fetchData();
  }, [bundleId]);

  useEffect(() => {
    async function fetchData() {
      if (isFetToken) {
        return;
      }
      if (tokensFetch) {
        const { data } = await tokensFetch();
        console.log("tokens", data);
        setTokens(data);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!tokens || tokens.length < 2) {
      return;
    }

    setQuantityTokenA(tokens[0]._quantity.toString());
    setQuantityTokenB(tokens[1]._quantity.toString());
    setQuantityTokenC(tokens[2]._quantity.toString());
  }, [tokens]);

  return (
    <Watermark
      zIndex={-9}
      style={
        // take the whole screen in the behind all the elements
        {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          minHeight: "100%",
        }
      }
      content="XRP Ledger"
      // image="https://w7.pngwing.com/pngs/459/4/png-transparent-xrp-symbol-black-hd-logo.png"
      height={130}
      width={150}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          color: "black",
          // centering the card
          margin: "auto",
          width: "1000px",
          marginTop: "30px",
        }}
        className="card"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            // take the whole width
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <h1 className="text-4xl my-0">ETF #{bundleId}</h1>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              // centering the elements vertically
              alignItems: "center",
              gap: "12px",
            }}
          >
            <img width="150" src="https://logowik.com/content/uploads/images/xrp-coin-xrp2517.jpg" alt="XRP Ledger" />
            <span>EASYA 2024</span>
          </div>
        </div>
        <br></br>
        {/* <p>{displayTxResult(contractsData[contractName].address)}</p> */}

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {bundles && <MatrixView setBundleId={setBundleId} bundleId={bundleId} bundles={bundles} />}
          {vault && vault._tokens && <PieToken input={vault}></PieToken>}
        </div>
        {/* {JSON.stringify(vault)} */}
        <br></br>
        {etfTokenAddress && <TokenBalanceAllowance isApprove name={"ETF"} tokenAddress={etfTokenAddress} />}
        {tokens &&
          tokens.map((token: any, index: number) => {
            return chain?.id === token._chainId ? (
              <TokenBalanceAllowance key={index} name={index.toString()} tokenAddress={token._address} />
            ) : (
              <b>
                {index} Token:{" "}
                {
                  // only show first 4 characters of the address and last 4 characters of the address
                  token._address.slice(0, 6) +
                    "..." +
                    token._address.slice(token._address.length - 4, token._address.length)
                }{" "}
                on another chain (chainId:{token._chainId})
              </b>
            );
          })}

        <br></br>
        <br></br>
        <h1>Collateral Vault</h1>
        <p>Bundle ID: {bundleId}</p>
        {etfTokenAddress}
        <b>Required Tokens</b>
        <DepositController
          quantity={quantityTokenA}
          setQuantity={setQuantityTokenA}
          requiredQuantity={tokens && tokens[0] ? tokens[0]._quantity : 0}
          tokenAddress={tokens && tokens[0] ? tokens[0]._address : ""}
          chainId={tokens && tokens[0] ? tokens[0]._chainId : ""}
        />
        <DepositController
          quantity={quantityTokenB}
          setQuantity={setQuantityTokenB}
          requiredQuantity={tokens && tokens[1] ? tokens[1]._quantity : 0}
          tokenAddress={tokens && tokens[1] ? tokens[1]._address : ""}
          chainId={tokens && tokens[1] ? tokens[1]._chainId : ""}
        />
        <DepositController
          quantity={quantityTokenB}
          setQuantity={setQuantityTokenB}
          requiredQuantity={tokens && tokens[2] ? tokens[2]._quantity : 0}
          tokenAddress={tokens && tokens[2] ? tokens[2]._address : ""}
          chainId={tokens && tokens[2] ? tokens[2]._chainId : ""}
        />
        <br></br>
        <br></br>
        <DepositButton
          bundleId={bundleId}
          state={vault?.state}
          tokenAddressA={tokens && tokens[0] ? tokens[0]._address : ""}
          quantityTokenA={quantityTokenA}
          tokenAddressB={tokens && tokens[1] ? tokens[1]._address : ""}
          quantityTokenB={quantityTokenB}
          tokenAddressC={tokens && tokens[2] ? tokens[2]._address : ""}
          quantityTokenC={quantityTokenC}
        ></DepositButton>
      </div>
    </Watermark>
  );
};

export default ETF;
