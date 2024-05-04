import React from "react";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const getRandomColorFromAddress = (address: string) => {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = address.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).substr(-2);
  }
  return color;
};

interface PieTokenProps {
  input: {
    _tokens: {
      _address: string;
      _quantity: string;
      _chainId: number;
      _contributor: string;
      _aggregator: string;
    }[];
    state: number;
  };
}
interface CustomChartDataset extends ChartDataset<"pie", number[]> {
  customLabels?: string[];
}

const PieToken: React.FC<PieTokenProps> = props => {
  // use your props here
  const { input } = props;
  const data = {
    datasets: [
      {
        data:  input._tokens.map(token => token._quantity.toString()),
        backgroundColor: input._tokens.map(token => getRandomColorFromAddress(token._address)),
        customLabels: input._tokens.map(token => token._address),
      },
    ],
    labels: input._tokens.map(token => token._address),
  };

  const emptyData = {
    datasets: [
      {
        data: [100],
        backgroundColor: [
            "rgba(211,211,211,1)",
        ],
        customLabels: ["No Token deposited"],
      },
    ],
    labels: ["No Data"],
  };

  return (
    <div style={{ width: "400px", height: "300px", marginBottom: "20px" }}>
      <Pie data={
        input._tokens.length > 0 ? data : emptyData
      }></Pie>
    </div>
  );
};

export default PieToken;
