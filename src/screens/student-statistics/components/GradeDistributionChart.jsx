import React, { useRef } from "react";
import { Box } from "@mui/material";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const GradeDistributionChart = ({ data }) => {
  const chartRef = useRef();

  const defaultData = {
    labels: [
      "A (90-100%)",
      "B (80-89%)",
      "C (70-79%)",
      "D (60-69%)",
      "F (Below 60%)",
    ],
    datasets: [
      {
        data: [45, 30, 15, 7, 3],
        backgroundColor: [
          "#10B981", // Green for A
          "#3B82F6", // Blue for B
          "#F59E0B", // Yellow for C
          "#EF4444", // Red for D
          "#6B7280", // Gray for F
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
        hoverBorderWidth: 3,
        hoverBorderColor: "#ffffff",
      },
    ],
  };

  const chartData = data || defaultData;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
          font: {
            size: 12,
            family: "Inter, sans-serif",
          },
          color: "#374151",
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const backgroundColor = dataset.backgroundColor[i];
                const value = dataset.data[i];
                const total = dataset.data.reduce((sum, val) => sum + val, 0);
                const percentage = ((value / total) * 100).toFixed(1);

                return {
                  text: `${label}: ${percentage}%`,
                  fillStyle: backgroundColor,
                  strokeStyle: backgroundColor,
                  lineWidth: 0,
                  pointStyle: "circle",
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: {
          size: 13,
          family: "Inter, sans-serif",
        },
        bodyFont: {
          size: 12,
          family: "Inter, sans-serif",
        },
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed;
            const total = context.dataset.data.reduce(
              (sum, val) => sum + val,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} students (${percentage}%)`;
          },
        },
      },
    },
    cutout: "60%",
    elements: {
      arc: {
        borderWidth: 2,
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
    },
  };

  return (
    <Box sx={{ position: "relative", height: 300 }}>
      <Doughnut ref={chartRef} data={chartData} options={options} />
    </Box>
  );
};

export default GradeDistributionChart;
