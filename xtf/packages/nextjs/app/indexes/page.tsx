"use client";

// import { useEffect, useState } from "react";
import * as young from "../../../../../coingecko/categories/young.json";
import * as category from "../../../../../coingecko/category.json";
import * as market from "../../../../../coingecko/market.json";
import { Avatar, Card, Col, Divider, InputNumber, List, Row, Select, Skeleton, Tag } from "antd";
import type { NextPage } from "next";
import { Watermark } from "antd";

const { Group } = Avatar;
const youngList = Object.values(young);

const Debug: NextPage = () => {
  const indexData = Object.values(market);
  const indexLimit = 100;

  return (
    <>
      <div className="text-center mt-8 p-10">
        <h1
          style={{
            fontSize: "2rem",
            marginBottom: "1rem",
          }}
        >
          Indexes
        </h1>
        <Divider orientation="left"></Divider>
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
                      href={`/indexes/${c.id}`}
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
      </div>
      <Divider></Divider>

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
  );
};

export default Debug;
