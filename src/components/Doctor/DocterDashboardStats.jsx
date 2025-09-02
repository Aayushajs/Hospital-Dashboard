import React, { useEffect, useRef, useState, useMemo } from "react";
import { FiCheckCircle } from "react-icons/fi";
import DashboardMainLineGraph from "./DashboardMainLineGraph";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

// Appointment Status Chart Component
const AppointmentStatusChart = ({ appointmentStatusData }) => {
  const isPie = !!(appointmentStatusData?.datasets && appointmentStatusData?.labels);
  const defaultData = useMemo(() => ([
    { month: "Jan", completed: 45, cancelled: 12 },
    { month: "Feb", completed: 52, cancelled: 8 },
    { month: "Mar", completed: 49, cancelled: 15 },
    { month: "Apr", completed: 64, cancelled: 10 },
    { month: "May", completed: 58, cancelled: 9 },
    { month: "Jun", completed: 72, cancelled: 14 },
    { month: "Jul", completed: 65, cancelled: 11 },
    { month: "Aug", completed: 78, cancelled: 13 },
    { month: "Sep", completed: 82, cancelled: 16 },
    { month: "Oct", completed: 76, cancelled: 12 },
    { month: "Nov", completed: 89, cancelled: 18 },
    { month: "Dec", completed: 93, cancelled: 15 },
  ]), []);

  const BarTooltip = ({ active, payload, label }) => (active && payload?.length ? (
    <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-md overflow-hidden">
      <p className="font-semibold text-white overflow-hidden">{label}</p>
      <p className="text-sm text-orange-400">Completed: <span className="font-medium text-white overflow-hidden">{payload[0].value}</span></p>
      <p className="text-sm text-gray-400">Cancelled: <span className="font-medium text-white">{payload[1].value}</span></p>
    </div>
  ) : null);

  if (isPie) {
    const ds = appointmentStatusData?.datasets?.[0];
    const valid = ds?.data && ds?.backgroundColor && appointmentStatusData.labels;
    if (!valid) {
      return (
        <div className="w-full h-[300px] overflow-hidden">
          <h3 className="font-bold text-lg text-white mb-5">Appointment Status</h3>
          <div className="flex items-center justify-center h-64 text-gray-400">No status data available</div>
        </div>
      );
    }
    const COLORS = ds.backgroundColor;
    const pieData = ds.data.map((v, i) => ({ name: i, value: v || 0 })).filter(i => i.value > 0);
    const PieTooltip = ({ active, payload }) => (active && payload?.length ? (
      <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-md">
        <p className="font-semibold text-white">{appointmentStatusData.labels[payload[0].name]}</p>
        <p className="text-sm" style={{ color: payload[0].payload.fill }}>Count: <span className="font-medium text-white">{payload[0].value}</span></p>
      </div>
    ) : null);
    return (
      <div className="w-full h-[300px] overflow-hidden">
        <h3 className="font-bold text-lg text-white mb-5">Appointment Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" labelLine={false} outerRadius={100} innerRadius={60} fill="#8884d8" dataKey="value">
              {pieData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip content={<PieTooltip />} />
            <Legend formatter={(_, entry) => <span style={{ color: '#fff' }}>{appointmentStatusData.labels[entry.payload.name]}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  const data = appointmentStatusData || defaultData;
  return (
    <div className="w-full h-[300px] overflow-hidden">
      <h3 className="font-bold text-lg text-white mb-5">Appointment Status</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9CA3AF" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9CA3AF" }} />
            <Tooltip content={<BarTooltip />} />
            <Legend verticalAlign="top" align="right" height={36} iconType="circle" iconSize={10} wrapperStyle={{ color: "#fff", paddingBottom: "20px" }} />
            <Bar dataKey="completed" name="Completed" fill="rgba(115, 141, 30, 0.81)" radius={[4,4,0,0]} />
            <Bar dataKey="cancelled" name="Cancelled" fill="#724d10ff" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};



// Monthly Appointments Chart Component
const MonthlyAppointmentsChart = ({ monthlyAppointmentsData }) => {
  const fallback = useMemo(() => ([
    { month: "Jan", appointments: 65 }, { month: "Feb", appointments: 78 },
    { month: "Mar", appointments: 72 }, { month: "Apr", appointments: 89 },
    { month: "May", appointments: 95 }, { month: "Jun", appointments: 108 },
    { month: "Jul", appointments: 120 }, { month: "Aug", appointments: 135 },
    { month: "Sep", appointments: 142 }, { month: "Oct", appointments: 138 },
    { month: "Nov", appointments: 156 }, { month: "Dec", appointments: 168 }
  ]), []);
  const data = useMemo(() => {
    try {
      return (Array.isArray(monthlyAppointmentsData) && monthlyAppointmentsData.length && monthlyAppointmentsData.every(i => i.month !== undefined && (typeof i.appointments === 'number' || i.appointments === 0))) ? monthlyAppointmentsData : fallback;
    } catch { return fallback; }
  }, [monthlyAppointmentsData, fallback]);
  const TT = ({ active, payload, label }) => (active && payload?.length ? (
    <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-md">
      <p className="font-semibold text-white">{label}</p>
      <p className="text-sm text-cyan-400">Appointments: <span className="font-medium text-white">{payload[0].value}</span></p>
    </div>
  ) : null);
  return (
    <div className="w-full h-full overflow-hidden">
      <h3 className="font-bold text-lg text-white mb-5 overflow-hidden">Monthly Appointments Trend</h3>
      <ResponsiveContainer width="100%" height={300} overflow="hidden">
        <LineChart data={data} margin={{ top:5, right:20, left:0, bottom:5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize:12, fill: "#dcdfe5ff" }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize:12, fill: "#e9edf5ff" }} />
          <Tooltip content={<TT />} />
          <Line type="monotone" dataKey="appointments" stroke="#00BCD4" strokeWidth={3} dot={{ r:4, fill: "#00BCD4" }} activeDot={{ r:6, fill: "#00BCD4" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

  // Error boundary class to catch errors in components
class ChartErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Chart error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="chart-error p-4 bg-opacity-25 bg-red-500 rounded-lg">
          <h3 className="text-white text-lg mb-2">Chart could not be displayed</h3>
          <p className="text-gray-300 text-sm">Please try refreshing the page</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple SVG Sparkline
const Sparkline = ({ data = [], stroke = '#00bcd4', fallbackValue = 0 }) => {
  const w = 180; const h = 54; const pad = 4;
  let series = Array.isArray(data) ? [...data] : [];
  // Treat all-zero arrays as empty for display purposes
  const allZero = series.length && series.every(v => v === 0);
  if (!series.length || allZero) {
    // Build a simple synthetic pattern influenced by fallbackValue (so different cards look distinct)
    const base = [1,3,2,4,3,5];
    const mod = (fallbackValue || 1) % 7;
    series = base.map((v,i) => v + ((i+mod)%3));
  }
  // If only a single data point, duplicate it to avoid division by zero in spacing
  if (series.length === 1) {
    series = [series[0], series[0]];
  }
  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = max - min || 1;
  const denom = (series.length - 1) || 1;
  const points = series.map((v,i) => {
    const x = pad + (i/denom) * (w - 2*pad);
    const y = h - pad - ((v - min)/range) * (h - 2*pad);
    return { x, y };
  });
  const pts = points.map(p => `${p.x},${p.y}`).join(' ');
  const first = points[0];
  const last = points[points.length - 1];
  const areaPoints = `${pts} ${last.x},${h-pad} ${first.x},${h-pad}`;
  const gradientId = `sparkgrad-${stroke.replace(/[^a-zA-Z0-9]/g,'')}-${fallbackValue}`;
  return (
    <svg width={w} height={h} className="sparkline" viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.55" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradientId})`} stroke="none" />
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" filter="url(#shadow)" />
    </svg>
  );
};

// Reusable stat card component
const StatCard = ({ variant, icon, value, label, data, color }) => (
  <div className={`stat-card ${variant}`}>
    <div className="stat-content">
      <div className={`stat-icon ${variant}`}>{icon}</div>
      <div className="stat-info">
        <h3>{value}</h3>
        <p>{label}</p>
      </div>
    </div>
    <div className="mini-chart-container">
  <Sparkline data={data} stroke={color} fallbackValue={value} />
    </div>
  </div>
);

const DocterDashboardStats = ({
  isMobile,
  stats = { pending: 0, accepted: 0, rejected: 0, completed: 0 },
  appointmentsCount = 0,
  patientsCount = 0,
  weeklyLineGraphData = null,
  monthlyLineGraphData = null,
  yearlyLineGraphData = null,
  dailyLineGraphData = null,
  appointmentStatusData = null,
  monthlyAppointmentsData = null,
}) => {
  // Default labels for different time periods
  const defaultLabelsDay = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const defaultLabelsWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const defaultLabelsMonth = Array.from(
    { length: 30 },
    (_, i) => `${i + 1}`
  );
  const defaultLabelsYear = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  
  // Default datasets for different time periods
  const defaultDatasetsArrWeek = [
    {
      label: "Pending",
      data: [2, 4, 3, 5, 2, 3, 4],
      borderColor: "#ffc107",
      backgroundColor: "rgba(255,193,7,0.2)",
      fill: true,
      tension: 0.4,
    },
    {
      label: "Accepted",
      data: [1, 2, 2, 3, 4, 3, 2],
      borderColor: "#28a745",
      backgroundColor: "rgba(40,167,69,0.2)",
      fill: true,
      tension: 0.4,
    },
    {
      label: "Completed",
      data: [3, 2, 4, 3, 5, 4, 3],
      borderColor: "#0d6efd",
      backgroundColor: "rgba(13,110,253,0.2)",
      fill: true,
      tension: 0.4,
    },
    {
      label: "Rejected",
      data: [2, 3, 2, 4, 3, 2, 5],
      borderColor: "#dc3545",
      backgroundColor: "rgba(220,53,69,0.2)",
      fill: true,
      tension: 0.4,
    },
  ];


  const [mainGraphFilter, setMainGraphFilter] = useState("day");

  // Auto rotate filters every 5s: day -> week -> month -> year -> day ...
  useEffect(() => {
    const order = ['day','week','month','year'];
    const interval = setInterval(() => {
      setMainGraphFilter(prev => order[(order.indexOf(prev) + 1) % order.length]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  // Manual filter selection 
  const handleFilterChange = (filter) => {
    setMainGraphFilter(filter);
  };

  // Choose the appropriate graph data based on the selected filter (prefer real data; no static fallback values)
  let mainGraphLabels = [];
  let mainGraphDataArr = [];
  if (mainGraphFilter === "day") {
    mainGraphLabels = dailyLineGraphData?.labels?.length ? dailyLineGraphData.labels : defaultLabelsDay;
    mainGraphDataArr = dailyLineGraphData?.datasetsArr?.length ? dailyLineGraphData.datasetsArr : [];
  } else if (mainGraphFilter === "week") {
    mainGraphLabels = weeklyLineGraphData?.labels?.length ? weeklyLineGraphData.labels : defaultLabelsWeek;
    mainGraphDataArr = weeklyLineGraphData?.datasetsArr?.length ? weeklyLineGraphData.datasetsArr : [];
  } else if (mainGraphFilter === "month") {
    mainGraphLabels = monthlyLineGraphData?.labels?.length ? monthlyLineGraphData.labels : defaultLabelsMonth;
    mainGraphDataArr = monthlyLineGraphData?.datasetsArr?.length ? monthlyLineGraphData.datasetsArr : [];
  } else {
    mainGraphLabels = yearlyLineGraphData?.labels?.length ? yearlyLineGraphData.labels : defaultLabelsYear;
    mainGraphDataArr = yearlyLineGraphData?.datasetsArr?.length ? yearlyLineGraphData.datasetsArr : [];
  }

  // For mini cards, always use weekly data
  const miniDataArr = 
    (weeklyLineGraphData && weeklyLineGraphData.datasetsArr) ? 
      weeklyLineGraphData.datasetsArr : 
      defaultDatasetsArrWeek;
  const miniLabels = 
    (weeklyLineGraphData && weeklyLineGraphData.labels) ? 
      weeklyLineGraphData.labels : 
      defaultLabelsWeek;
  
  const sparkPending = [...(weeklyLineGraphData?.datasetsArr?.[0]?.data || miniDataArr[0]?.data || [])];
  const sparkAccepted = [...(weeklyLineGraphData?.datasetsArr?.[1]?.data || miniDataArr[1]?.data || [])];
  const sparkPatients = [...(weeklyLineGraphData?.weeklyPatients || [] )];
  const sparkAppointments = [...(weeklyLineGraphData?.weeklyAppointments || [])];

  

  return (
    <div className="dashboard-stats">
      {/* Main Line Graph with filter tabs */}
      <div className="main-graph-section">
        <div className="main-graph-header">
          <div className="main-graph-title">
            <span
              style={{ color: "#00bcd4", fontWeight: 600, fontSize: "1.1rem" }}
            >
              {mainGraphFilter.charAt(0).toUpperCase() + mainGraphFilter.slice(1)}{" "}
              Overview
            </span>
          </div>
          <div className="main-graph-filters">
            <button 
              className={`filter-tab ${mainGraphFilter === 'day' ? 'active' : ''}`}
              onClick={() => handleFilterChange('day')}
            >
              Day
            </button>
            <button 
              className={`filter-tab ${mainGraphFilter === 'week' ? 'active' : ''}`}
              onClick={() => handleFilterChange('week')}
            >
              Week
            </button>
            <button 
              className={`filter-tab ${mainGraphFilter === 'month' ? 'active' : ''}`}
              onClick={() => handleFilterChange('month')}
            >
              Month
            </button>
            <button 
              className={`filter-tab ${mainGraphFilter === 'year' ? 'active' : ''}`}
              onClick={() => handleFilterChange('year')}
            >
              Year
            </button>
          </div>
        </div>
        <DashboardMainLineGraph
          labels={mainGraphLabels}
          data={mainGraphDataArr[0]?.data || []}
          datasetArr={mainGraphDataArr.length ? mainGraphDataArr : null}
          color="#00bcd4"
          bgColor="rgba(0,188,212,0.12)"
        />
      </div>
      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          variant="pending"
          icon={<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" /><path d="M12 7c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1s1-.45 1-1V8c0-.55-.45-1-1-1z" /></svg>}
          value={stats.pending}
          label="Pending Appointments"
          data={sparkPending}
          color="#ffc107"
        />
        <StatCard
          variant="accepted"
          icon={<FiCheckCircle />}
          value={stats.accepted}
          label="Accepted Appointments"
          data={sparkAccepted}
          color="#28a745"
        />
        <StatCard
          variant="patients"
          icon={<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>}
          value={patientsCount}
          label="Total Patients"
          data={sparkPatients}
          color="#0d6efd"
        />
        <StatCard
          variant="appointments"
          icon={<svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" /></svg>}
          value={appointmentsCount}
          label="Total Appointments"
          data={sparkAppointments}
          color="#6f42c1"
        />
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Appointment Status Chart */}
        <div className="">
          <ChartErrorBoundary>
            <AppointmentStatusChart appointmentStatusData={appointmentStatusData} />
          </ChartErrorBoundary>
        </div>

        {/* Monthly Appointments Chart */}
        <div className="">
          <ChartErrorBoundary>
            <MonthlyAppointmentsChart monthlyAppointmentsData={monthlyAppointmentsData} />
          </ChartErrorBoundary>
        </div>
      </div>


      <style jsx="true">{`
  /* (Removed Performance & Analytics specific scrollbar rules) */
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
          box-shadow: 0 2px 12px 0 rgba(22, 33, 62, 0.12);
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .stat-card:hover {
          box-shadow: 0 4px 24px 0 rgba(22, 33, 62, 0.18);
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
          box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08);
        }
        .stat-icon svg,
        .stat-icon {
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
          background: transparent;
          border-radius: 0;
          box-shadow: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .main-graph-section {
          width: 100%;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, #16213e 80%, #1f2a48 100%);
          border-radius: 16px;
          padding: 1.2rem;
          box-shadow: 0 2px 12px 0 rgba(22, 33, 62, 0.12);
        }
        .main-graph-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .main-graph-title {
          margin-bottom: 0.5rem;
        }
        .main-graph-filters {
          display: flex;
          gap: 0.5rem;
        }
        .filter-tab {
          background-color: rgba(0, 188, 212, 0.08);
          color: #a0aec0;
          border: none;
          border-radius: 6px;
          padding: 0.4rem 0.8rem;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .filter-tab:hover {
          background-color: rgba(0, 188, 212, 0.15);
          color: #e2e8f0;
        }
        .filter-tab.active {
          background-color: rgba(0, 188, 212, 0.25);
          color: #00bcd4;
          font-weight: 500;
        }
        .main-line-graph-container {
          width: 100%;
          height: 120px;
          background: rgba(0, 188, 212, 0.04);
          border-radius: 12px;
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
          border-radius: 16px;
          overflow: hidden;
          padding: 1.2rem 1rem 1rem 1rem;
          box-shadow: 0 2px 12px 0 rgba(22, 33, 62, 0.12);
        }
        /* Hide scrollbars ONLY for charts in this section */
        .charts-section .recharts-wrapper {
          overflow-x: hidden !important;
          overflow-y: hidden !important;
        }
        .charts-section .recharts-wrapper * {
          scrollbar-width: none !important;
        }
        .charts-section .recharts-wrapper::-webkit-scrollbar,
        .charts-section .recharts-wrapper *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
          background: transparent !important;
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
  /* (Removed Performance & Analytics styles) */
      `}</style>
    </div>
  );
};

export default DocterDashboardStats;
