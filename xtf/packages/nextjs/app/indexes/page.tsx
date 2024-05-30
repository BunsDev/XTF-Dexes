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
    </>
  );
};

export default Debug;
