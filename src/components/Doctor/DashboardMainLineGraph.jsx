import React, { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";

const DashboardMainLineGraph = ({ labels, data, color = "#00bcd4", bgColor = "rgba(0,188,212,0.12)" }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    let chartInstance;
    if (chartRef.current) {
      chartInstance = new Chart(chartRef.current, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Metrics Overview",
              data: data,
              borderColor: color,
              backgroundColor: bgColor,
              fill: true,
              tension: 0.4,
              pointRadius: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
          },
          scales: {
            y: { beginAtZero: true, grid: { color: "#23315a" }, ticks: { color: "#a0aec0" } },
            x: { grid: { color: "#23315a" }, ticks: { color: "#a0aec0" } },
          },
        },
      });
    }
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [labels, data, color, bgColor]);

  return (
    <div className="main-line-graph-container">
      <canvas ref={chartRef} height={120} width={600} />
      <style jsx>{`
        .main-line-graph-container {
          width: 100%;
          height: 120px;
          margin-bottom: 1.5rem;
          background: rgba(0,188,212,0.04);
          border-radius: 12px;
          box-shadow: 0 1px 6px 0 rgba(22,33,62,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default DashboardMainLineGraph;
