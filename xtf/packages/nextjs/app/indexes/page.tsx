"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import * as young from "../../../../../coingecko/categories/young.json";
import * as category from "../../../../../coingecko/category.json";
import * as market from "../../../../../coingecko/market.json";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Avatar, Card, Col, Divider, InputNumber, List, Modal, Row, Select, Switch, Tag } from "antd";
import { Watermark } from "antd";
import { Steps } from "antd";
import type { NextPage } from "next";
import { useWriteContract } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getAllContracts } from "~~/utils/scaffold-eth/contractsData";

const { Group } = Avatar;
const youngList = Object.values(young);

const Indexes: NextPage = () => {
  const [showAll, setShowAll] = useState(false);
  const [lastUpdate, setLastUpdate] = useState("1 June 2024");
  const [modalState, setModalState] = useState(0);
  const indexData = Object.values(market);
  const indexLimit = 20;

  const contractName = "IndexAggregator";
  const { targetNetwork } = useTargetNetwork();

  const isModalVisible = modalState > 0;

  const contractsData = getAllContracts();

  const { writeContract } = useWriteContract();

  const currentChain = targetNetwork.name === "Sepolia" ? "ETHEREUM" : targetNetwork.name;

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
      content={"Sepolia"}
      height={230}
      width={250}
    >
      <div
        style={{
          marginLeft: "70px",
          marginRight: "70px",
        }}
        className="text-center mt-8 p-10"
      >
        <h1
          style={{
            fontSize: "2rem",
            marginBottom: "1rem",
          }}
        >
          Indexes
        </h1>
        <Divider orientation="left"></Divider>
        <h1
          style={{
            fontSize: "1.5rem",
            marginBottom: "1rem",
          }}
        >
          TLS Oracle Indexes
        </h1>
        <h2>
          <Avatar
            style={{
              width: "30px",
              height: "30px",
              marginRight: "10px",
            }}
            src="https://pbs.twimg.com/profile_images/1737538221880315905/RSy15epn_400x400.jpg"
          ></Avatar>
          Attestations provided through <b>Reclaim</b> Protocol{" "}
          <InfoCircleOutlined
            onClick={() => {
              setModalState(1);
            }}
            twoToneColor="#52c41a"
          />
        </h2>
        <br />
        <br />

        <br></br>

        <Row gutter={130}>
          <Col span={8}>
            <Card
              title={
                <a
                  href="/indexes/tlsoracle/forbes"
                  // target="_blank"
                  rel="noopener noreferrer"
                >
                  Defi Pulse Index (DPI) by Forbes
                </a>
              }
              bordered={false}
              style={{
                height: "220px",
                overflow: "hidden",
              }}
              extra={
                <Group maxCount={3} size="large" maxStyle={{ color: "#f56a00", backgroundColor: "#fde3cf" }}>
                  <Avatar src="https://freelogopng.com/images/all_img/1684047661forbes-icon-png.png" />
                </Group>
              }
            >
              <p
                style={{
                  display: "-webkit-box",
                  lineHeight: "1.2em",
                  height: "6em",
                  WebkitLineClamp: 5,
                  whiteSpace: "pre-wrap",
                  textAlign: "left",
                }}
              >
                <b>Reclaim AppId:</b> 0x15dB9F453C222CEfDb87ecb91d6B47124C58B488
                <br></br>
                <b>Origin URL</b> :{" "}
                <a
                  href="https://www.forbes.com/digital-assets/categories/defi-pulse-index-dpi/?sh=3950c3fe77ab"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "blue",
                  }}
                >
                  Forbes- Defi pulse URL
                </a>
                <br></br>
                <br></br>
                The Defi Pulse Index (DPI) is designed to track the performance of a selection of the largest and most
                liquid DeFi tokens. The index is weighted based on the value of each token's circulating supply.
                <br />
              </p>
              <br />
            </Card>
            <br />
          </Col>
        </Row>
        <br />
        <Divider orientation="left"></Divider>
        <h1
          style={{
            fontSize: "1.5rem",
            marginBottom: "1rem",
          }}
        >
          Signature Protocols & Attestation Providers
        </h1>
        <h2>
          <Avatar
            style={{
              width: "45px",
              height: "45px",
              marginRight: "10px",
            }}
            src="https://img.cryptorank.io/coins/eth_sign1666614067820.png"
          ></Avatar>
          Attestations provided through <b>ETH.Sign</b> Protocol{" "}
          <InfoCircleOutlined
            onClick={() => {
              setModalState(2);
            }}
            twoToneColor="#52c41a"
          />
        </h2>
        <br />
        <br />

        <Row gutter={130}>
          <Col span={8}>
            <Card
              title={
                <a
                  href="/indexes/attestationprotocol/multisig"
                  // target="_blank"
                  rel="noopener noreferrer"
                >
                  MultiSig Attestation
                </a>
              }
              bordered={false}
              style={{
                height: "220px",
                overflow: "hidden",
              }}
              extra={
                <Group maxCount={3} size="large" maxStyle={{ color: "#f56a00", backgroundColor: "#fde3cf" }}>
                  <Avatar src="https://yt3.googleusercontent.com/YSnvnM1YCBJCkRZkZlnfjHCstaEuYh9hVhGC30Yr4X8yKWZRNIjj1RZMdRz2o9GzhSn1ycNP=s900-c-k-c0x00ffffff-no-rj" />
                  <Avatar src="https://yt3.googleusercontent.com/GojVNnQxHXs5QQktrtrUq145i_p4zFnRuiriuS7y170sRtezL79Ke86DkIkiiBH7CnH0nKcCkg=s900-c-k-c0x00ffffff-no-rj" />
                  <Avatar src=" https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2RCExxal8BLDfwx7PH1VXZXS9YH9LW0YZUVS16P0JETXdWLSxOgMTOO8zyF66uvT37T8&usqp=CAU" />
                </Group>
              }
            >
              <p
                style={{
                  display: "-webkit-box",
                  lineHeight: "1.2em",
                  height: "6em",
                  WebkitLineClamp: 5,
                  whiteSpace: "pre-wrap",
                  textAlign: "left",
                }}
              >
                <b>Trusted entities:</b>
                <a
                  style={{
                    color: "blue",
                  }}
                  href="https://messari.io/"
                >
                  {" "}
                  Messari
                </a>{" "}
                <br />
                <b>Trusted entuty:</b>
                <a
                  style={{
                    color: "blue",
                  }}
                  href="https://www.coingecko.com/en"
                >
                  {" "}
                  Coingecko
                </a>{" "}
                <br />
                <b>Trusted entuty:</b>
                <a
                  style={{
                    color: "blue",
                  }}
                  href="https://www.bankless.com/"
                >
                  {" "}
                  Bankless
                </a>{" "}
                <br />
                <br></br>
                <b>Origin URL</b> :{" "}
                <a
                  href="https://www.forbes.com/digital-assets/categories/defi-pulse-index-dpi/?sh=3950c3fe77ab"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "blue",
                  }}
                >
                  Attestation URL
                </a>
              </p>
              <br />
            </Card>
            <br />
          </Col>
        </Row>

        <Divider orientation="left"></Divider>
        <h1
          style={{
            fontSize: "1.5rem",
            marginBottom: "1rem",
          }}
        >
          Price Oralces & OnChain aggregators
        </h1>
        <h2>
          <Avatar
            style={{
              width: "30px",
              height: "30px",
              marginRight: "10px",
            }}
            src="https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png?1696502009"
          ></Avatar>
          Powered by <b>ChainLink</b> Data Feeds{" "}
          <InfoCircleOutlined
            onClick={() => {
              setModalState(3);
            }}
            twoToneColor="#52c41a"
          />
        </h2>
        <Switch
          checkedChildren="Show All Tokens"
          unCheckedChildren="Show Categories"
          checked={showAll}
          onChange={setShowAll}
          style={{
            marginBottom: "1rem",
          }}
        />
        <br />
        <br />

        {!showAll && (
          <Row gutter={130}>
            {category
              // get the first 10 categories
              .slice(0, 16)
              .filter(c => c.content !== "")
              .map(c => (
                <Col span={8} key={c.name}>
                  <Card
                    title={
                      <a
                        // remove also ( )
                        // href={`/indexes/${c.name.toLowerCase().replace(/\(|\)/g, "").replace(/\s/g, "-")}`}
                        href={`/indexes/aggregator/${c.id}`}
                        // target="_blank"
                        rel="noopener noreferrer"
                      >
                        {c.name}
                      </a>
                    }
                    bordered={false}
                    style={{
                      height: "200px",
                      overflow: "hidden",
                    }}
                    extra={
                      <Group maxCount={3} size="large" maxStyle={{ color: "#f56a00", backgroundColor: "#fde3cf" }}>
                        {c.top_3_coins.map((coin: any) => (
                          <Avatar key={coin} src={coin} />
                        ))}
                      </Group>
                    }
                  >
                    <p
                      style={{
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        lineHeight: "1.2em",
                        height: "6em",
                        WebkitLineClamp: 5,
                        whiteSpace: "pre-wrap",
                        textAlign: "left",
                      }}
                    >
                      {c.content}
                    </p>
                  </Card>
                  <br />
                </Col>
              ))}
          </Row>
        )}
        {showAll && (
          <>
            <b>Last Price Sample</b>: {lastUpdate}
            <br></br>
            <b>Time Window</b>: 30 days
            <br></br>
            <b>Bribe</b>: 0.05 sepETH
            <br></br>
            <b>Contract Reserve:</b> 1 sepETH (200 days left)
            <br></br>
            <br></br>
            <div
              style={{
                display: "flex",
                // center the buttons
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <button
                style={{
                  marginTop: "10px",
                  paddingRight: "5px",
                  paddingLeft: "5px",
                  borderRadius: "10px",
                  color: "white",
                  backgroundColor: "#f56a00",
                }}
                onClick={() => {
                  setLastUpdate(new Date().toLocaleString());
                }}
              >
                Collect Prices (Bribe)
              </button>

              {currentChain === "ETHEREUM" ? (
                <button
                  style={{
                    marginTop: "10px",
                    padding: "3px",
                    paddingRight: "7px",
                    paddingLeft: "7px",
                    borderRadius: "10px",
                    color: "white",
                    // green
                    backgroundColor: "#52c41a",
                  }}
                  onClick={async () => {
                    await writeContract({
                      address: contractsData[contractName].address,
                      functionName: "setChainId",
                      abi: contractsData[contractName].abi,
                      args: [targetNetwork.id, targetNetwork.id],
                    });
                  }}
                >
                  Persist Index
                </button>
              ) : (
                <button
                  style={{
                    marginTop: "10px",
                    padding: "3px",
                    paddingRight: "7px",
                    paddingLeft: "7px",
                    borderRadius: "10px",
                    color: "white",
                    // blue
                    backgroundColor: "#1890ff",
                  }}
                  onClick={async () => {
                    console.log("communicating to mainchain");
                    console.log(contractsData[contractName].address);
                    console.log(contractsData[contractName].abi);
                    await writeContract({
                      address: contractsData[contractName].address,
                      functionName: "setChainId",
                      abi: contractsData[contractName].abi,
                      args: ["11155111", "11155111"],
                    });
                    // setLastUpdate(new Date().toLocaleString());
                  }}
                >
                  Communicate to Mainchain
                </button>
              )}
            </div>
            <br></br>
            <br></br>
            <List
              // className="demo-loadmore-list"
              itemLayout="horizontal"
              bordered
              style={{
                marginTop: "80px",
                minHeight: "400px",
                width: "800px",
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
                  style={{
                    background: "#f4f8ff",
                  }}
                  actions={[
                    <a key="list-loadmore-edit">{"Rank #" + item.market_cap_rank}</a>,
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
                      <a href="https://ant.design">
                        {
                          <>
                            {item.name}
                            <Tag
                              style={{
                                marginLeft: "10px",
                              }}
                            >
                              {youngList.find((y: any) => String(y.symbol).toLowerCase() === item.symbol.toLowerCase())
                                ?.networks?.[0].Name || "Wrapped Ethereum (Sepolia)"}
                            </Tag>
                          </>
                        }
                      </a>
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
          </>
        )}
      </div>
      <Divider></Divider>

      <Modal
        width={1500}
        // title="ChainLink Data Feeds"
        visible={isModalVisible}
        onOk={() => setModalState(0)}
        onCancel={() => setModalState(0)}
        footer={null}
      >
        <Image
          width={1400}
          height={1200}
          src={
            modalState === 1
              ? "/images/tls_oracle.png"
              : modalState === 2
              ? "/images/attestation.png"
              : "/images/index_aggr.png"
          }
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            borderRadius: "5px",
            boxShadow: "0px 1px 6px rgba(0, 0, 0, 0.25)",
          }}
          alt="Available on OpenSea"
        />
        <br />
      </Modal>
    </Watermark>
  );
};

export default Indexes;
