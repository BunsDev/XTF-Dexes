"use client";

import * as meme from "../../../../../coingecko/categories/meme-token.json";
import * as category from "../../../../../coingecko/category.json";
import { Avatar, Card, Col, Divider, Row } from "antd";
import type { NextPage } from "next";

// import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

const { Group } = Avatar;

// export const metadata = getMetadata({
//   title: "Indexes",
//   description: "Get the latest indexes from the XTF protocol.",
// });

const Debug: NextPage = () => {
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
        <h1
          style={{
            fontSize: "2rem",
            marginBottom: "1rem",
          }}
        >
          Meme Coins
        </h1>
      </div>
    </>
  );
};

export default Debug;
