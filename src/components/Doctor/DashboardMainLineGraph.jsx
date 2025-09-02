import React, { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";

const DashboardMainLineGraph = ({ 
  labels, 
  data, 
  datasetArr = null,
  color = "#00bcd4", 
  bgColor = "rgba(0,188,212,0.12)" 
}) => {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    // Destroy previous instance if exists
    if (chartInstanceRef.current) {
      try {
        chartInstanceRef.current.destroy();
      } catch (e) {
        console.warn('Chart destroy failed (main graph):', e);
      }
      chartInstanceRef.current = null;
    }

    if (!canvasRef.current) {
      return;
    }

    try {
      const defaultDataset = [{
        label: "Metrics Overview",
        data: data,
        borderColor: color,
        backgroundColor: bgColor,
        fill: true,
        tension: 0.4,
        pointRadius: 2,
      }];
      const datasets = datasetArr || defaultDataset;
      chartInstanceRef.current = new Chart(canvasRef.current, {
        type: 'line',
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: { 
              display: !!datasetArr,
              position: 'top',
              labels: { color: '#a0aec0', boxWidth: 12, padding: 15 }
            },
            tooltip: { 
              enabled: true,
              backgroundColor: 'rgba(22, 33, 62, 0.8)',
              titleColor: '#e2e8f0',
              bodyColor: '#e2e8f0',
              borderColor: 'rgba(0, 188, 212, 0.3)',
              borderWidth: 1,
              cornerRadius: 6,
              padding: 10,
              displayColors: true,
              boxWidth: 8,
              boxHeight: 8
            }
          },
          scales: {
            y: { beginAtZero: true, grid: { color: '#23315a' }, ticks: { color: '#a0aec0' }, border: { dash: [4,4] } },
            x: { grid: { color: '#23315a' }, ticks: { color: '#a0aec0' }, border: { dash: [4,4] } }
          },
          interaction: { mode: 'nearest', intersect: false, axis: 'x' },
          elements: { line: { tension: 0.4 }, point: { radius: 2, hoverRadius: 5 } }
        }
      });
    } catch (err) {
      console.error('Error creating main line chart:', err);
    }

    return () => {
      if (chartInstanceRef.current) {
        try { chartInstanceRef.current.destroy(); } catch (e) { console.warn('Chart destroy failed (cleanup main):', e); }
        chartInstanceRef.current = null;
      }
    };
  }, [labels, data, datasetArr, color, bgColor]);

  return (
    <div className="main-line-graph-container">
  <canvas ref={canvasRef} height={120} width={600} />
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
