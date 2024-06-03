"use client";

import { useEffect, useState } from "react";
import * as young from "../../../../../../../coingecko/categories/young.json";
import * as category from "../../../../../../../coingecko/category.json";
import { CheckCircleTwoTone } from "@ant-design/icons";
import { Reclaim } from "@reclaimprotocol/js-sdk";
import { Avatar, InputNumber, List, Modal, Popover, Select, Tag, Watermark } from "antd";
import { ArcElement, CategoryScale, Chart, LineElement, LinearScale, LogarithmicScale, PointElement } from "chart.js";
import type { NextPage } from "next";
import { Line, Pie } from "react-chartjs-2";
import ReactJson from "react-json-view";
import QRCode from "react-qr-code";
import { useWriteContract } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getAllContracts } from "~~/utils/scaffold-eth/contractsData";

Chart.register(CategoryScale);
Chart.register(LinearScale);
Chart.register(LogarithmicScale);
Chart.register(PointElement);
Chart.register(LineElement);
Chart.register(ArcElement);

const { Group } = Avatar;
const youngList = Object.values(young);
const categoryList = Object.values(category);

const reclaimClient = new Reclaim.ProofRequest("0x015ee8411294AAA16dB7274bDA515ee147eAFb70");

const colors = [
  "rgb(255, 99, 132)",
  "rgb(54, 162, 235)",
  "rgb(255, 205, 86)",
  "rgb(75, 192, 192)",
  "rgb(153, 102, 255)",
  "rgb(255, 159, 64)",
  "rgb(255, 159, 64)",
  "rgb(255, 99, 132)",
  "rgb(54, 162, 235)",
  "rgb(255, 205, 86)",
  "rgb(75, 192, 192)",
];

const IndexPage: NextPage = ({ params }: { params: { indexName: string } }) => {
  const [chartData, setChartData] = useState<any>();
  const [indexLimit, setIndexLimit] = useState(10);
  const [indexData, setIndexData] = useState<any>([]);
  const [equalWeighted, setEqualWeighted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [ready, setReady] = useState(true);
  const [proof, setProof] = useState<any>();
  const [showList, setShowList] = useState(false);

  const { targetNetwork } = useTargetNetwork();

  useEffect(() => {
    // last 30 days for labels
    // wait for 15 seconds before fetching the data
    setTimeout(() => {
      fetch(`/${"proofs"}.json`)
        .then(response => response.json())
        .then(data => setProof(data))
        .catch(error => console.error("Error fetching data:", error));
    }, 55000);

    // console.log("indexData", indexData);
  }, [url]);

  useEffect(() => {
    // last 30 days for labels
    const date = "June 01, 2024 16:16:36";
    const tokenInfo = [
      {
        id: "uniswap",
        symbol: "uni",
        name: "Uniswap",
        image: "https://assets.coingecko.com/coins/images/12504/large/uni.jpg?1696512319",
        current_price: 7.57,
        market_cap: 5708336124,
        market_cap_rank: 24,
      },
      {
        id: "balancer",
        name: "Balancer",
        image: "https://assets.coingecko.com/coins/images/11683/large/Balancer.png?1696511572",
        current_price: 3.55,
        market_cap_rank: 293,
        market_cap: 201897285,
        symbol: "bal",
      },
      {
        id: "staked-ether",
        symbol: "steth",
        name: "Lido Staked Ether",
        image: "https://assets.coingecko.com/coins/images/13442/large/steth_logo.png?1696513206",
        current_price: 3081.93,
        market_cap: 28885052035,
        market_cap_rank: 8,
      },
      {
        id: "maker",
        symbol: "mkr",
        name: "Maker",
        image: "https://assets.coingecko.com/coins/images/1364/large/Mark_Maker.png?1696502423",
        current_price: 2822.23,
        market_cap: 2623387220,
        market_cap_rank: 50,
      },
      {
        id: "aave",
        symbol: "aave",
        name: "Aave",
        image: "https://assets.coingecko.com/coins/images/12645/large/AAVE.png?1696512452",
        current_price: 88.76,
        market_cap: 1318264689,
        market_cap_rank: 76,
      },
      {
        image: "https://assets.coingecko.com/coins/images/11849/large/yearn.jpg?1696511720",
        current_price: 6889.22,
        market_cap_rank: 271,
        id: "yearn-finance",
        market_cap: 229905033,
        symbol: "yfi",
        name: "yearn.finance",
      },
      {
        image: "https://assets.coingecko.com/coins/images/2518/large/weth.png?1696503332",
        current_price: 3066.85,
        market_cap_rank: null,
        id: "weth",
        market_cap: 0.0,
        symbol: "weth",
        name: "WETH",
      },
      {
        id: "havven",
        symbol: "snx",
        name: "Synthetix Network",
        image: "https://assets.coingecko.com/coins/images/3406/large/SNX.png?1696504103",
        current_price: 2.69,
        market_cap: 881888714,
        market_cap_rank: 105,
      },
      {
        id: "compound-governance-token",
        symbol: "comp",
        name: "Compound",
        image: "https://assets.coingecko.com/coins/images/10775/large/COMP.png?1696510737",
        current_price: 56.01,
        market_cap: 383777741,
        market_cap_rank: 201,
      },
    ];
    setIndexData(tokenInfo);
  }, []);

  const contractName = "TLSIndexNotary";
  const contractsData = getAllContracts();

  console.log("contractsData", contractsData);

  const { writeContract } = useWriteContract();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const today = new Date();
    const labels = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      return date.toLocaleDateString();
    });

    const data = indexData ? indexData.map((m: any) => m.current_price).slice(0, 30) : [];
    if (data.length < 30) {
      // push the same values from the start day by day
      let j = 0;
      for (let i = data.length; i < 30; i++) {
        data.push(data[j++]);
      }
    }

    setChartData({
      labels,
      datasets: [
        {
          label: "Meme Token Price",
          data,
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    });
  }, [indexData]);
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
    setProof({ loading: true });
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
      content={targetNetwork.name}
      height={230}
      width={250}
    >
      <div className="text-center mt-8 p-10">
        <br />
        <h1
          style={{
            fontSize: "3rem",
          }}
        >
          {"Forbes Top 5 Index Fund"}
        </h1>
        <br />
        <h2
          style={{
            fontSize: "1.3rem",
            marginBottom: "1rem",
          }}
        >
          {"TLS Proof Verified "}
          <CheckCircleTwoTone twoToneColor="#52c41a" />
        </h2>
        <Popover
          content={
            <>
              <p>
                Attestation provided by <a href="https://www.reclaimprotocol.org/">Reclaim Protocol</a>
              </p>
            </>
          }
          title={
            <>
              <p>
                <span>TLS ZK Proof Verfied</span> <CheckCircleTwoTone twoToneColor="#52c41a" />
              </p>
            </>
          }
        ></Popover>
        <br />
        <p
          style={{
            width: "1000px",
            // border: "1px solid #ccc",
            // text justifies the text
            // center the text
            margin: "auto",
          }}
        >
          {/* Meme coins are coins that are created as a joke or meme. They are often created to make fun of the
          cryptocurrency industry or to make a quick buck. Some meme coins have gained popularity and have become
          valuable, while others have faded into obscurity. */}
          {categoryList.find((c: any) => c.id === params.indexName)?.content}
        </p>
        <b>Website Parsed</b>:{" "}
        <a
          style={{
            color: "blue",
          }}
          href="https://www.forbes.com/digital-assets/categories/defi-pulse-index-dpi/?sh=2d135cad77ab"
        >
          Forbes
        </a>
        <br />
        <br />
        <button
          style={{
            padding: "5px 10px",
            borderRadius: "5px",
            marginRight: "10px",
            backgroundColor: "#f56a00",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
          onClick={() => getVerificationReq()}
        >
          Generate Verification Request
        </button>
        {url && (
          <>
            <button
              style={{
                padding: "5px 10px",
                borderRadius: "5px",
                marginRight: "10px",
                backgroundColor: "#f56a00",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
              onClick={() => window.open(url, "_blank")}
            >
              Open link
            </button>
            {!proof.loading && (
              <button
                style={{
                  padding: "5px 10px",
                  borderRadius: "5px",
                  marginRight: "10px",
                  // green
                  backgroundColor: "#52c41a",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={async () => {
                  await writeContract({
                    address: contractsData[contractName].address,
                    functionName: "verifyProof",
                    abi: contractsData[contractName].abi,
                    args: [
                      {
                        claimInfo: {
                          provider: proof?.claimData?.provider,
                          parameters: proof?.claimData?.parameters,
                          context: proof?.claimData?.context,
                        },

                        signedClaim: {
                          claim: {
                            identifier: proof?.identifier,
                            owner: proof?.claimData?.owner,
                            timestampS: proof?.claimData?.timestampS,
                            epoch: proof?.claimData?.epoch,
                          },
                          signatures: proof?.signatures,
                        },
                      },
                      "maker,uniswap,lido,aave,synthetix,yearn,balancer,weth,compound",
                    ],
                  });
                  setShowList(true);
                  console.log("proof", proof);
                }}
              >
                Verify Proof
              </button>
            )}

            <br></br>
            <br></br>
            <br></br>
            <p
              style={{
                width: "1000px",
                margin: "auto",
                textAlign: "left",
              }}
            >
              Scan the QRCODE with the Reclaim App for generiting the proof of the attestation
              <br></br>from the website
              <a
                style={{
                  color: "blue",
                }}
                href="https://www.forbes.com/digital-assets/categories/defi-pulse-index-dpi/?sh=2d135cad77ab"
              >
                https://www.forbes.com/digital-assets/categories/defi-pulse-index-dpi/?sh=2d135cad77ab
              </a>
            </p>
            <br />
            <br />

            <QRCode
              style={{
                margin: "auto",
                display: "block",
              }}
              value={url}
            />
          </>
        )}
        {/* <QRCode value={url} />

         */}
        <div
          style={{
            // left align the text
            textAlign: "left",
            width: "1000px",
            // border: "1px solid #ccc",
            // text justifies the text
            // center the text
            margin: "auto",
          }}
        >
          <br></br>
          <b>Proof Provider</b>:{" "}
          <a
            style={{
              color: "blue",
            }}
            href="https://dev.reclaimprotocol.org/provider/7a1d5b75-7b6b-4709-9596-56860e8d21e6"
          >
            Provider URL
          </a>
          <br></br>
          <b>Proof App</b>:{" "}
          <a
            style={{
              color: "blue",
            }}
            href="https://dev.reclaimprotocol.org/applications"
          >
            DeFi Pulse Insight on Forbes
          </a>
          <br></br>
        </div>
        {proof && (
          <>
            <p
              style={{
                width: "1000px",
                margin: "auto",
                textAlign: "left",
                // bold the text
                fontWeight: "bold",
              }}
            >
              Proof
            </p>
            <br />
            <ReactJson
              style={{
                width: "1000px",
                margin: "auto",
                textAlign: "left",
              }}
              src={proof}
            />
          </>
        )}
        {/* {proof && <pre
          style={{
            overflow: "scroll",
            backgroundColor: "#f9f9f9",
            padding: "20px",
            width: "1000px",
            margin: "auto",
            textAlign: "left",
          }}
        
        >{JSON.stringify(proof, null, 2)}</pre>}
        <br /> */}
        <br></br>
        <br></br>
        {showList && !proof.loading && (
          <List
            // className="demo-loadmore-list"
            itemLayout="horizontal"
            bordered
            style={{
              marginTop: "80px",
              minHeight: "400px",
              width: "1000px",
              margin: "auto",
            }}
            dataSource={
              // meme is not an array, so we need to convert it to an array
              Object.keys(indexData)
                .map((k: any) => indexData[k])
                .slice(0, indexLimit)
            }
            renderItem={item => (
              <List.Item
                actions={[
                  // <a key="list-loadmore-edit">{"Rank #" + item.market_cap_rank}</a>,
                  <a key="list-loadmore-edit">{"$" + item.market_cap}</a>,
                  <a key="list-loadmore-more">{"Lqdty: " + Math.random().toFixed(2) + "P"}</a>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      style={{
                        width: "50px",
                        height: "50px",
                      }}
                      src={item.image}
                    />
                  }
                  title={
                    <>
                      {
                        <>
                          <Popover>
                            {item.name}
                            <Tag
                              style={{
                                cursor: "pointer",
                                marginLeft: "10px",
                                color: "green",
                              }}
                              onClick={() => {
                                console.log("clicked");
                              }}
                            >
                              {
                                youngList.find((y: any) => String(y.symbol).toLowerCase() === item.symbol.toLowerCase())
                                  ?.networks?.[0].Name
                              }
                            </Tag>
                          </Popover>
                        </>
                      }
                    </>
                  }
                  description={
                    <span>
                      {youngList.find((y: any) => String(y.symbol).toLowerCase() === item.symbol.toLowerCase())
                        ?.descriptions?.en !== undefined
                        ? youngList
                            .find((y: any) => String(y.symbol).toLowerCase() === item.symbol.toLowerCase())
                            ?.descriptions?.en?.slice(0, 100) + "..."
                        : "No description available"}
                    </span>
                  }
                />
              </List.Item>
            )}
          />
        )}
        {/* central button for launch an XTF Fund */}
        <br />
        {showList && proof && !proof.loading && (
          <button
            style={{
              padding: "10px 20px",
              borderRadius: "5px",
              // backgroundColor: "#1890ff",
              backgroundColor: "#f56a00",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
            onClick={showModal}
          >
            Launch XTF Fund
          </button>
        )}
        <Modal
          width={1200}
          title={
            <h1
              style={{
                fontSize: "1.7rem",
              }}
            >
              Launch a new XTF Fund
            </h1>
          }
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          // hide cancel button
          footer={[
            <button
              key={1}
              style={{
                padding: "10px 20px",
                borderRadius: "5px",
                // backgroundColor: "#1890ff",
                backgroundColor: "#f56a00",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
              onClick={handleOk}
            >
              Create Fund
            </button>,
          ]}
        >
          <div
            style={{
              border: "1px solid #ccc",
              // center the text
              margin: "auto",
              width: "1000px",
              padding: "20px",
              marginTop: "30px",
            }}
          >
            <br />
            <div
              style={{
                width: "400px",
                margin: "auto",
              }}
            >
              <br />
              <div
                style={{
                  // width: "500px",
                  margin: "auto",
                  display: "flex",
                }}
              >
                <InputNumber
                  style={{
                    width: "150px",
                    marginRight: "20px",
                  }}
                  label="Index Limit"
                  min={3}
                  max={indexData.length}
                  value={indexLimit}
                  onChange={(value: any) => setIndexLimit(value as number)}
                />
                <InputNumber
                  style={{
                    width: "200px",
                    marginRight: "20px",
                  }}
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  min={100}
                  defaultValue={1000}
                  max={10000}
                />
                <Select
                  defaultValue="cap_weighted"
                  style={{
                    width: "150px",
                  }}
                  onChange={(value: any) => {
                    if (value === "equal_weighted") {
                      setEqualWeighted(true);
                    } else {
                      setEqualWeighted(false);
                    }
                  }}
                >
                  <Select.Option value="cap_weighted">Cap Weighted</Select.Option>
                  <Select.Option value="equal_weighted">Equal Weighted</Select.Option>
                </Select>
              </div>
              <br />
              <Pie
                data={{
                  labels: indexData.map((m: any) => m.market_cap).slice(0, indexLimit),
                  datasets: [
                    {
                      label: "My First Dataset",
                      borderWidth: 2,
                      data: equalWeighted
                        ? Array(indexLimit).fill(1)
                        : indexData.map((m: any) => m.market_cap).slice(0, indexLimit),
                      backgroundColor: colors,
                      // hoverOffset: 4,
                    },
                  ],
                }}
              ></Pie>
            </div>
            <br />
            {/* print a custom legen made by small square of the color and name of asset next to it */}
            <div
              style={{
                width: "960px",
                margin: "auto",
              }}
            >
              {indexData.slice(0, indexLimit).map((m: any, i: number) => (
                <Group key={i} style={{ display: "inline-block", margin: "10px" }}>
                  <Avatar
                    style={{
                      backgroundColor: colors[i],
                      width: "20px",
                      height: "20px",
                      marginRight: "10px",
                    }}
                  ></Avatar>
                  <span>{m.name}</span>
                </Group>
              ))}
            </div>
          </div>
          <br />
        </Modal>
      </div>
    </Watermark>
  );
};

export default IndexPage;
