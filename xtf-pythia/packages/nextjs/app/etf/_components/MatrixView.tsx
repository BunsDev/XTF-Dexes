"use client";

import React from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

function getColor(state: number, selected: boolean, bundleId: number) {
  //  return a color based on bundleId randomly

  if (state === 0) {
    // return dark gray if selected or gray if not
    if (["42", "27", "12", "65", "7", "18", "71"].includes(bundleId.toString())) {
      return selected ? "#FFA500" : "#FFD700";
    }
    return selected ? "#696969" : "#D3D3D3";
  }
  if (state === 1) {
    // dark blue if selected or blue if not
    if (["42", "27", "12", "65", "7", "18", "71"].includes(bundleId.toString())) {
      return selected ? "#FFA500" : "#FFD700";
    }

    return selected ? "#00008B" : "#869cda";
  }
  if (state === 2) {
    // green
    return selected ? "#00FF00" : "#008000";
  }
  if (state === 3) {
    // red
    return selected ? "#FF0000" : "#8B0000";
  }
  return "#D3D3D3";
}
export function MatrixView({
  bundles,
  bundleId,
  setBundleId,
}: {
  bundles: Array<any>;
  bundleId: any;
  setBundleId: any;
}) {
  const series: { name: string; data: any[] }[] = [];
  const numberOfColumns = 16; // Previously numberOfRows
  const numberOfRows = 6; // Previously numberOfColumns

  for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
    const rowData: {
      name: string;
      data: any[];
    } = { name: `Vault`, data: [] };

    for (let colIndex = 0; colIndex < numberOfColumns; colIndex++) {
      // Invert the row index to start from the bottom
      const cellValue = rowIndex * numberOfColumns + colIndex;
      // let cellColor = "#D3D3D3"; // Assign a random color
      const cellColor = getColor(bundles[cellValue], bundleId === cellValue, cellValue);
      rowData.data.push({
        x: `Col ${colIndex + 1}`,
        y: cellValue,
        fillColor: cellColor,
      });
    }
    series.push(rowData);
  }

  const handleCellClick = (event: any, chartContext: any, { seriesIndex, dataPointIndex }: any) => {
    const bundleId = seriesIndex * numberOfColumns + dataPointIndex;
    setBundleId(bundleId);
  };

  const state = {
    options: {
      states: {
        normal: {
          filter: {
            type: "none",
            value: 0,
          },
        },
        hover: {
          filter: {
            type: "lighten",
            value: 0.15,
          },
        },
        active: {
          allowMultipleDataPointsSelection: false,
          filter: {
            type: "darken",
            value: 1,
          },
        },
      },
      legend: {
        show: false,
        onItemClick: {
          toggleDataSeries: true,
        },
        onItemHover: {
          highlightDataSeries: false,
        },
      },
      chart: {
        events: {
          dataPointSelection: handleCellClick,
        },
        toolbar: {
          show: false,
        },
        width: "100%",
      },
      tooltip: {
        x: {
          show: false,
        },
      },

      stroke: {
        width: 2,
        colors: ["black"],
      },
      plotOptions: {
        heatmap: {
          radius: 2,
          enableShades: true,
          useFillColorAsStroke: false,

          shadeIntensity: 0.5,
          distributed: true, // Ensure colors are applied per-cell
          colorScale: {
            inverse: true,
            ranges: series.flatMap(row =>
              row.data.map(cell => ({
                from: cell.y,
                to: cell.y,
                color: cell.fillColor,
              })),
            ),
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        type: "category",
        categories: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"],
        labels: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          show: false,
        },
      },
    },
    series,
  };

  // console.log("series", JSON.stringify(series));

  const legendItems = [
    { color: "gray", label: "Empty" },
    { color: "lightblue", label: "Open" },
    { color: "green", label: "Minted" },
    { color: "red", label: "Burned" },
  ];

  return (
    <div>
      {typeof window !== "undefined" && state && state.options && state.series && (
        <Chart height={300} options={state.options as any} series={state.series as any} type="heatmap" width={500} />
      )}
      <div
        className="legend"
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        {legendItems.map((item, index) => (
          <div
            key={index}
            className="legend-item"
            style={{
              display: "flex",
              flexDirection: "row",
              marginRight: "0.5rem",
              justifyContent: "space-between",
            }}
          >
            <div className="legend-label">
              <span
                style={{
                  color: item.color,
                  fontSize: "1.5rem",
                  marginRight: "0.3rem",
                }}
              >
                ■
              </span>
              {item.label}
            </div>
          </div>
        ))}
      </div>
      <br></br>
    </div>
  );
}
