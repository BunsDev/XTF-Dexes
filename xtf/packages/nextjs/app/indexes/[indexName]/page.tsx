"use client";

import { useEffect, useState } from "react";
import * as young from "../../../../../../coingecko/categories/young.json";
import { Avatar, InputNumber, List, Select, Tag } from "antd";
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

const Debug: NextPage = ({ params }: { params: { indexName: string } }) => {
  const [chartData, setChartData] = useState<any>();
  const [indexLimit, setIndexLimit] = useState(10);
  const [indexData, setIndexData] = useState<any>([]);

  useEffect(() => {
    // last 30 days for labels
    fetch(`/categories/${params.indexName}.json`)
      .then(response => response.json())
      .then(data => setIndexData(data))
      .catch(error => console.error("Error fetching data:", error));
    console.log("indexData", indexData);
  }, []);

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

  return (
    <>
      <div className="text-center mt-8 p-10">
        <div
          style={{
            height: "250px",
            margin: "auto",
          }}
        >
          {chartData && (
            <Line
              width={1300}
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
        <br />
        <h1
          style={{
            fontSize: "2rem",
            marginBottom: "1rem",
          }}
        >
          {params.indexName}
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
            max={indexData.length}
            value={indexLimit}
            onChange={value => setIndexLimit(value as number)}
          />
          <Select
            defaultValue="cap_weighted"
            style={{
              width: "150px",
            }}
          >
            <Select.Option value="cap_weighted">Cap Weighted</Select.Option>
            <Select.Option value="equal_weighted">Equal Weighted</Select.Option>
          </Select>
        </div>
        <br />
        <br />

        {indexData && (
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
                            {"Sepolia"}
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
          <br />
        </div>
      </div>
    </>
  );
};

export default Debug;
