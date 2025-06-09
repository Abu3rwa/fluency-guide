import "./studentStatsCharts.css";
import React from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Sample data for average progress % per month
const progressData = {
  labels: months.slice(0, 6),
  datasets: [
    {
      label: "Average Progress (%)",
      data: [55, 60, 65, 70, 85, 90],
      borderColor: "#4caf50",
      backgroundColor: "rgba(76, 175, 80, 0.4)",
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointHoverRadius: 7,
      borderWidth: 3,
    },
  ],
};

const progressOptions = {
  responsive: true,
  plugins: {
    legend: { display: true, position: "top" },
    title: {
      display: true,
      text: "Students Progress Over Months",
      font: { size: 18 },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: {
        stepSize: 20,
        callback: (value) => `${value}%`,
      },
      title: {
        display: true,
        text: "Progress %",
      },
    },
    x: {
      title: { display: true, text: "Month" },
    },
  },
};

// Sample data for monthly student registrations
const registrationData = {
  labels: months.slice(0, 6),
  datasets: [
    {
      label: "Registrations",
      data: [12, 19, 8, 15, 25, 30],
      backgroundColor: "#2196f3",
      borderRadius: 6,
      barPercentage: 0.6,
    },
  ],
};

const registrationOptions = {
  responsive: true,
  plugins: {
    legend: { display: true, position: "top" },
    title: {
      display: true,
      text: "Students Registration Monthly",
      font: { size: 18 },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Number of Students",
      },
      ticks: {
        stepSize: 5,
      },
    },
    x: {
      title: { display: true, text: "Month" },
    },
  },
};

export default function StudentStatsCharts() {
  return (
    <section
      className="charts-container"
      aria-label="Student statistics charts"
    >
      <div className="chart-wrapper">
        <Line
          data={progressData}
          options={progressOptions}
          aria-label="Students progress line chart"
        />
      </div>
      <div className="chart-wrapper">
        <Bar
          data={registrationData}
          options={registrationOptions}
          aria-label="Students registration bar chart"
        />
      </div>
    </section>
  );
}
