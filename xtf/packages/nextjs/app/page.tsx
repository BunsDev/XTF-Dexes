"use client";

import { useState } from "react";
import Link from "next/link";
import { Reclaim } from "@reclaimprotocol/js-sdk";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import QRCode from "react-qr-code";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [url, setUrl] = useState("");
  const [ready, setReady] = useState(true);
  const [proof, setProof] = useState({});

  const reclaimClient = new Reclaim.ProofRequest("0x015ee8411294AAA16dB7274bDA515ee147eAFb70");

  const getVerificationReq = async () => {
    const APP_ID = "0x015ee8411294AAA16dB7274bDA515ee147eAFb70";
    const reclaimClient = new Reclaim.ProofRequest(APP_ID);
    const providerIds = [
      "0e38076a-dfdc-4adc-a11c-8773d7836167", // Forbes-Defi-Pulse
    ];
    await reclaimClient.buildProofRequest(providerIds[0]);
    const APP_SECRET = "0x1cba3e3021e062b9ac6399cbd857338f2072ecd3dbbb8509e7e1178d7e52da7c"; // your app secret key.
    reclaimClient.setSignature(await reclaimClient.generateSignature(APP_SECRET));
    const { requestUrl, statusUrl } = await reclaimClient.createVerificationRequest();
    console.log("Request URL", requestUrl);
    setUrl(requestUrl);
    setProof({loading: true});
    await reclaimClient.startSession({
      onSuccessCallback: proof => {
        console.log("Verification success", proof);

        setReady(true);
        setProof(Reclaim.transformForOnchain(proof));
        // Your business logic here
      },
      onFailureCallback: error => {
        console.error("Verification failed", error);
        // Your business logic here to handle the error
      },
    });
    console.log("Session ended");
  };

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold-ETH 2</span>
          </h1>
          <div className="flex justify-center items-center space-x-2">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
          <p className="text-center text-lg">
            Get started by editing{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/nextjs/app/page.tsx
            </code>
          </p>
          <p className="text-center text-lg">
            Edit your smart contract{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              YourContract.sol
            </code>{" "}
            in{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/hardhat/contracts
            </code>
          </p>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              {/* <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/debug" passHref className="link">
                  Debug Contracts
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p> */}

              <button onClick={() => getVerificationReq()}>Generate Verification Request</button>
              <button onClick={() => window.open(url, "_blank")}>Open link</button>
              <QRCode value={url} />
              <p>Proof</p>
              {proof && <pre>{JSON.stringify(proof, null, 2)}</pre>}
              {/* {ready && <VerifyProof proof={proof}></VerifyProof>} */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
