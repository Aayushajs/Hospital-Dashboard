import React, { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import { FiCheckCircle } from "react-icons/fi";
import DashboardMainLineGraph from "./DashboardMainLineGraph";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

// Appointment Status Chart Component
const AppointmentStatusChart = () => {
  const data = [
    { month: 'Jan', completed: 45, cancelled: 12 },
    { month: 'Feb', completed: 52, cancelled: 8 },
    { month: 'Mar', completed: 49, cancelled: 15 },
    { month: 'Apr', completed: 64, cancelled: 10 },
    { month: 'May', completed: 58, cancelled: 9 },
    { month: 'Jun', completed: 72, cancelled: 14 },
    { month: 'Jul', completed: 65, cancelled: 11 },
    { month: 'Aug', completed: 78, cancelled: 13 },
    { month: 'Sep', completed: 82, cancelled: 16 },
    { month: 'Oct', completed: 76, cancelled: 12 },
    { month: 'Nov', completed: 89, cancelled: 18 },
    { month: 'Dec', completed: 93, cancelled: 15 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        
        <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-md overflow-hidden">
          <p className="font-semibold text-white">{label}</p>
          <p className="text-sm text-orange-400">
            Completed: <span className="font-medium text-white">{payload[0].value}</span>
          </p>
          <p className="text-sm text-gray-400">
            Cancelled: <span className="font-medium text-white">{payload[1].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      <h3 className="font-bold text-lg text-white mb-5">Appointment Status</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false}
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            align="right"
            height={36}
            iconType="circle"
            iconSize={10}
            wrapperStyle={{ color: '#fff', paddingBottom: '20px' }}
          />
          <Bar 
            dataKey="completed" 
            name="Completed" 
            fill="rgba(115, 141, 30, 0.81)" 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="cancelled" 
            name="Cancelled" 
            fill="#724d10ff" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Monthly Appointments Chart Component
const MonthlyAppointmentsChart = () => {
  const data = [
    { month: 'Jan', appointments: 65 },
    { month: 'Feb', appointments: 78 },
    { month: 'Mar', appointments: 72 },
    { month: 'Apr', appointments: 89 },
    { month: 'May', appointments: 95 },
    { month: 'Jun', appointments: 108 },
    { month: 'Jul', appointments: 120 },
    { month: 'Aug', appointments: 135 },
    { month: 'Sep', appointments: 142 },
    { month: 'Oct', appointments: 138 },
    { month: 'Nov', appointments: 156 },
    { month: 'Dec', appointments: 168 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-md">
          <p className="font-semibold text-white">{label}</p>
          <p className="text-sm text-cyan-400">
            Appointments: <span className="font-medium text-white">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      <h3 className="font-bold text-lg text-white mb-5">Monthly Appointments Trend</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false}
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="appointments" 
            stroke="#00BCD4" 
            strokeWidth={3}
            dot={{ r: 4, fill: '#00BCD4' }}
            activeDot={{ r: 6, fill: '#00BCD4' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const DocterDashboardStats = ({
  isMobile,
  stats,
  appointmentsCount,
  patientsCount,
  miniLineGraphData,
  appointmentStatusData,
  monthlyAppointmentsData,
}) => {
  // Debug: log miniLineGraphData to check what is being passed
  console.log('miniLineGraphData:', miniLineGraphData);

  // Always provide default data for mini charts if missing
  const defaultLabelsWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const defaultLabelsMonth = Array.from({length: 30}, (_, i) => `Day ${i+1}`);
  const defaultLabelsYear = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const defaultDatasetsArrWeek = [
    { label: "Pending", data: [2, 4, 3, 5, 2, 3, 4], borderColor: "#ffc107", backgroundColor: "rgba(255,193,7,0.2)", fill: true, tension: 0.4 },
    { label: "Accepted", data: [1, 2, 2, 3, 4, 3, 2], borderColor: "#28a745", backgroundColor: "rgba(40,167,69,0.2)", fill: true, tension: 0.4 },
    { label: "Patients", data: [3, 2, 4, 3, 5, 4, 3], borderColor: "#0d6efd", backgroundColor: "rgba(13,110,253,0.2)", fill: true, tension: 0.4 },
    { label: "Appointments", data: [2, 3, 2, 4, 3, 2, 5], borderColor: "#6f42c1", backgroundColor: "rgba(111,66,193,0.2)", fill: true, tension: 0.4 },
  ];
  const defaultDatasetsArrMonth = [
    { label: "Pending", data: Array.from({length: 30}, () => Math.floor(Math.random()*5)+2), borderColor: "#ffc107", backgroundColor: "rgba(255,193,7,0.2)", fill: true, tension: 0.4 },
    { label: "Accepted", data: Array.from({length: 30}, () => Math.floor(Math.random()*4)+1), borderColor: "#28a745", backgroundColor: "rgba(40,167,69,0.2)", fill: true, tension: 0.4 },
    { label: "Patients", data: Array.from({length: 30}, () => Math.floor(Math.random()*6)+2), borderColor: "#0d6efd", backgroundColor: "rgba(13,110,253,0.2)", fill: true, tension: 0.4 },
    { label: "Appointments", data: Array.from({length: 30}, () => Math.floor(Math.random()*5)+2), borderColor: "#6f42c1", backgroundColor: "rgba(111,66,193,0.2)", fill: true, tension: 0.4 },
  ];
  const defaultDatasetsArrYear = [
    { label: "Pending", data: Array.from({length: 12}, () => Math.floor(Math.random()*20)+10), borderColor: "#ffc107", backgroundColor: "rgba(255,193,7,0.2)", fill: true, tension: 0.4 },
    { label: "Accepted", data: Array.from({length: 12}, () => Math.floor(Math.random()*15)+5), borderColor: "#28a745", backgroundColor: "rgba(40,167,69,0.2)", fill: true, tension: 0.4 },
    { label: "Patients", data: Array.from({length: 12}, () => Math.floor(Math.random()*25)+10), borderColor: "#0d6efd", backgroundColor: "rgba(13,110,253,0.2)", fill: true, tension: 0.4 },
    { label: "Appointments", data: Array.from({length: 12}, () => Math.floor(Math.random()*20)+10), borderColor: "#6f42c1", backgroundColor: "rgba(111,66,193,0.2)", fill: true, tension: 0.4 },
  ];

  const [mainGraphFilter, setMainGraphFilter] = useState("week");
  useEffect(() => {
    const filters = ["week", "month", "year"];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % filters.length;
      setMainGraphFilter(filters[idx]);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  let mainGraphLabels, mainGraphDataArr;
  if (mainGraphFilter === "week") {
    mainGraphLabels = miniLineGraphData?.labels?.length === 7 ? miniLineGraphData.labels : defaultLabelsWeek;
    mainGraphDataArr = miniLineGraphData?.datasetsArr?.length === 4 ? miniLineGraphData.datasetsArr : defaultDatasetsArrWeek;
  } else if (mainGraphFilter === "month") {
    mainGraphLabels = miniLineGraphData?.labels?.length === 30 ? miniLineGraphData.labels : defaultLabelsMonth;
    mainGraphDataArr = miniLineGraphData?.datasetsArr?.length === 4 ? miniLineGraphData.datasetsArr : defaultDatasetsArrMonth;
  } else {
    mainGraphLabels = miniLineGraphData?.labels?.length === 12 ? miniLineGraphData.labels : defaultLabelsYear;
    mainGraphDataArr = miniLineGraphData?.datasetsArr?.length === 4 ? miniLineGraphData.datasetsArr : defaultDatasetsArrYear;
  }

  // For mini cards, always use week data
  const miniDataArr = miniLineGraphData?.datasetsArr?.length === 4 ? miniLineGraphData.datasetsArr : defaultDatasetsArrWeek;
  const miniLabels = miniLineGraphData?.labels?.length === 7 ? miniLineGraphData.labels : defaultLabelsWeek;
  const pendingChartRef = useRef(null);
  const acceptedChartRef = useRef(null);
  const patientsChartRef = useRef(null);
  const appointmentsChartRef = useRef(null);

  useEffect(() => {
    // Destroy existing charts before creating new ones
    const destroyCharts = () => {
      [pendingChartRef, acceptedChartRef, patientsChartRef, appointmentsChartRef].forEach(ref => {
        if (ref.current?.chart) {
          ref.current.chart.destroy();
        }
      });
    };

    try {
      destroyCharts();

      // Mini Line Graphs for each stat card (live data)
      const chartOptions = {
        type: "line",
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, display: false },
            x: { display: false, ticks: { display: false }, grid: { display: false } },
          },
          elements: { point: { radius: 0 } },
        },
      };
      // Pending
      if (pendingChartRef.current && miniDataArr[0]) {
        pendingChartRef.current.chart = new Chart(pendingChartRef.current, {
          ...chartOptions,
          data: { labels: miniLabels, datasets: [miniDataArr[0]] },
        });
      }
      // Accepted
      if (acceptedChartRef.current && miniDataArr[1]) {
        acceptedChartRef.current.chart = new Chart(acceptedChartRef.current, {
          ...chartOptions,
          data: { labels: miniLabels, datasets: [miniDataArr[1]] },
        });
      }
      // Patients
      if (patientsChartRef.current && miniDataArr[2]) {
        patientsChartRef.current.chart = new Chart(patientsChartRef.current, {
          ...chartOptions,
          data: { labels: miniLabels, datasets: [miniDataArr[2]] },
        });
      }
      // Appointments
      if (appointmentsChartRef.current && miniDataArr[3]) {
        appointmentsChartRef.current.chart = new Chart(appointmentsChartRef.current, {
          ...chartOptions,
          data: { labels: miniLabels, datasets: [miniDataArr[3]] },
        });
      }
    } catch (error) {
      console.error("Error initializing charts:", error);
    }

    return destroyCharts;
  }, [miniLineGraphData]);

  return (
    <div className="dashboard-stats">
      {/* Main Line Graph auto-cycling */}
      <div className="main-graph-section">
        <div className="main-graph-title">
          <span style={{color: '#00bcd4', fontWeight: 600, fontSize: '1.1rem'}}>
            {mainGraphFilter.charAt(0).toUpperCase() + mainGraphFilter.slice(1)} Overview
          </span>
        </div>
        <DashboardMainLineGraph
          labels={mainGraphLabels}
          data={mainGraphDataArr[0]?.data || [2, 4, 3, 5, 2, 3, 4]}
          color="#00bcd4"
          bgColor="rgba(0,188,212,0.12)"
        />
      </div>
      {/* Stats Grid */}
      <div className="stats-grid">
        {/* Pending Appointments */}
        <div className="stat-card pending">
          <div className="stat-content">
            <div className="stat-icon pending">
              <svg viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                <path d="M12 7c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1s1-.45 1-1V8c0-.55-.45-1-1-1z" />
              </svg>
            </div>
            <div className="stat-info">
              <h3>{stats.pending}</h3>
              <p>Pending Appointments</p>
            </div>
          </div>
          <div className="mini-chart-container">
            <canvas ref={pendingChartRef} height={54} width={180} />
          </div>
        </div>

        {/* Accepted Appointments */}
        <div className="stat-card accepted">
          <div className="stat-content">
            <div className="stat-icon accepted">
              <FiCheckCircle />
            </div>
            <div className="stat-info">
              <h3>{stats.accepted}</h3>
              <p>Accepted Appointments</p>
            </div>
          </div>
          <div className="mini-chart-container">
            <canvas ref={acceptedChartRef} height={54} width={180} />
          </div>
        </div>

        {/* Total Patients */}
        <div className="stat-card patients">
          <div className="stat-content">
            <div className="stat-icon patients">
              <svg viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <div className="stat-info">
              <h3>{patientsCount}</h3>
              <p>Total Patients</p>
            </div>
          </div>
          <div className="mini-chart-container">
            <canvas ref={patientsChartRef} height={54} width={180} />
          </div>
        </div>

        {/* Total Appointments */}
        <div className="stat-card appointments">
          <div className="stat-content">
            <div className="stat-icon appointments">
              <svg viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
              </svg>
            </div>
            <div className="stat-info">
              <h3>{appointmentsCount}</h3>
              <p>Total Appointments</p>
            </div>
          </div>
          <div className="mini-chart-container">
            <canvas ref={appointmentsChartRef} height={54} width={180} />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Appointment Status Chart */}
        <div className="">
          <AppointmentStatusChart />
        </div>

        {/* Monthly Appointments Chart */}
        <div className="">
          <MonthlyAppointmentsChart />
        </div>
      </div>

      <style jsx="true">{`
        .dashboard-stats {
          margin-bottom: 1.5rem;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .stat-card {
          background: linear-gradient(135deg, #16213e 80%, #1f2a48 100%);
          border-radius: 16px;
          padding: 1.2rem 1rem 1rem 1rem;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          box-shadow: 0 2px 12px 0 rgba(22,33,62,0.12);
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .stat-card:hover {
          box-shadow: 0 4px 24px 0 rgba(22,33,62,0.18);
          transform: translateY(-2px) scale(1.02);
        }
        .stat-content {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          margin-right: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px 0 rgba(0,0,0,0.08);
        }
        .stat-icon svg, .stat-icon {
          fill: currentColor;
          width: 28px;
          height: 28px;
        }
        .stat-card.pending .stat-icon {
          background-color: rgba(255, 193, 7, 0);
          color: #ffc107;
        }
        .stat-card.accepted .stat-icon {
          background-color: rgba(40, 167, 69, 0.18);
          color: #28a745;
        }
        .stat-card.patients .stat-icon {
          background-color: rgba(13, 110, 253, 0.18);
          color: #0d6efd;
        }
        .stat-card.appointments .stat-icon {
          background-color: rgba(111, 66, 193, 0.18);
          color: #6f42c1;
        }
        .stat-info h3 {
          margin: 0;
          font-size: 2rem;
          color: #fff;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .stat-info p {
          margin: 0.25rem 0 0;
          color: #a0aec0;
          font-size: 1rem;
          font-weight: 500;
        }
        .mini-chart-container {
          height: 54px;
          width: 100%;
          margin-top: 0.5rem;
          background: rgba(255,255,255,0.03);
          border-radius: 8px;
          box-shadow: 0 1px 4px 0 rgba(22,33,62,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .main-graph-section {
          width: 100%;
          margin-bottom: 1.5rem;
        }
        .main-graph-title {
          margin-bottom: 0.5rem;
        }
        .main-line-graph-container {
          width: 100%;
          height: 120px;
          background: rgba(0,188,212,0.04);
          border-radius: 12px;
          box-shadow: 0 1px 6px 0 rgba(22,33,62,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .charts-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.2rem;
          overflow: hidden;
        }
        .chart-card {
          background: linear-gradient(135deg, #16213e 80%, #1f2a48 100%);
          border-radius: 16px;
        overflow: hidden;
          padding: 1.2rem 1rem 1rem 1rem;
          box-shadow: 0 2px 12px 0 rgba(22,33,62,0.12);
        }
        .chart-card h3 {
          margin-top: 0;
          margin-bottom: 1rem;
          color: #fff;
          overflow: hidden;
          font-size: 1.2rem;
          font-weight: 600;
        }
        .chart-container {
          position: relative;
          height: 220px;
          width: 100%;
          overflow: hidden;
        }
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .charts-section {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 576px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default DocterDashboardStats;