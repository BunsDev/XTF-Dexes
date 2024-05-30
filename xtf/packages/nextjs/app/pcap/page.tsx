"use client";

import { useEffect, useState } from "react";
import * as meme from "../../../../../coingecko/categories/meme-token.json";
import * as young from "../../../../../coingecko/categories/young.json";
import * as category from "../../../../../coingecko/category.json";
import { Avatar, Card, Col, Divider, List, Row, Skeleton, Tag, InputNumber, Select } from "antd";
import { CategoryScale, Chart, LineElement, LinearScale, LogarithmicScale, PointElement } from "chart.js";
import type { NextPage } from "next";
import { Line } from "react-chartjs-2";

Chart.register(CategoryScale);
Chart.register(LinearScale);
Chart.register(LogarithmicScale);
Chart.register(PointElement);
Chart.register(LineElement);

const { Group } = Avatar;
const youngList = Object.values(young);

const Debug: NextPage = () => {
  const [chartData, setChartData] = useState<any>();
  const [indexLimit, setIndexLimit] = useState(10);

  useEffect(() => {
    // last 30 days for labels
    const today = new Date();
    const labels = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      return date.toLocaleDateString();
    });

    // get the first 30 prices
    const data = meme.map((m: any) => m.current_price).slice(0, 30);

    // console.log('symbol', youngList.find((y: any) => String(y.symbol).toLowerCase() === "btc")?.descriptions?.en);

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
  }, []);

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
                  title={c.name}
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
      <div className="text-center mt-8 p-10">
        <div
          style={{
            height: "400px",
            margin: "auto",
          }}
        >
          {chartData && (
            <Line
              width={800}
              options={{
                scales: {
                  x: {
                    display: false,
                    grid: {
                      display: false,
                    },
                  },
                  y: {
                    display: false,
                    type: "logarithmic",
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
              data={chartData}
            />
          )}
        </div>
        <h1
          style={{
            fontSize: "2rem",
            marginBottom: "1rem",
          }}
        >
          Meme Coins
        </h1>
        <br />
        <p
          style={{
            width: "1000px",
            // border: "1px solid #ccc",
            // text justifies the text
            textAlign: "justify",
            margin: "auto",
          }}
        >
          Meme coins are coins that are created as a joke or meme. They are often created to make fun of the
          cryptocurrency industry or to make a quick buck. Some meme coins have gained popularity and have become
          valuable, while others have faded into obscurity.
        </p>
        <br />
        <div
          style={{
            width: "1000px",
            margin: "auto",
          }}
        >
          <InputNumber
            style={{
              width: "100px",
              marginRight: "20px",
            }}
            min={3}
            max={meme.length}
            value={indexLimit}
            onChange={value => setIndexLimit(value as number)}
          />
          <Select
            defaultValue="cap_weighted"
            style={{
              width: "120px",
            }}
          >
            <Select.Option value="cap_weighted">Cap Weighted</Select.Option>
            <Select.Option value="equal_weighted">Equal Weighted</Select.Option>
          </Select>
        </div>
        <br />
        <br />

        {meme && (
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
              Object.keys(meme)
                .map((k: any) => meme[k])
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
                          >{"Sepolia"}</Tag>
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
        )}
        {/* central button for launch an XTF Fund */}
        <div
          style={{
            marginTop: "80px",
          }}
        >
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
          >
            Launch an XTF Fund
          </button>
        </div>
      </div>
    </>
  );
};

export default Debug;
