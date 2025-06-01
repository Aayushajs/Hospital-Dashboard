  import axios from "axios";
  import React, { useContext, useEffect, useState, useMemo } from "react";
  import { toast } from "react-toastify";
  import { Context } from "../main"; // Assuming Context is correctly imported
  import { Navigate } from "react-router-dom";
  import { FiSearch, FiFilter, FiDownload, FiTrash2 } from "react-icons/fi";
  import { FaUsers, FaUserCheck, FaUserTimes, FaUserClock } from "react-icons/fa";
  import { GiDoctorFace } from "react-icons/gi";
  import * as XLSX from "xlsx";
  import Lottie from "lottie-react";
  import notFoundAnimation from "../../public/notfountAnimation.json";
  import { Line, Bar, Doughnut } from "react-chartjs-2";
  import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
  } from "chart.js";

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
  );

  const NotFoundDisplay = () => (
    <div style={{ textAlign: 'center', padding: '2rem', color: '#adb5bd' }}>
      <Lottie
        animationData={notFoundAnimation}
        loop={true}
        style={{ height: 200, width: 200, margin: '0 auto', overflow: 'hidden' }}
      />
      <h3 style={{ color: '#ffffff', marginTop: '1rem' }}>No Doctors Found</h3>
      <p>Try adjusting your search or filter criteria.</p>
    </div>
  );

  const MiniLineChart = ({ data, color }) => {
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      scales: {
        x: { display: false },
        y: { display: false }
      },
      elements: {
        point: { radius: 0 }
      }
    };

    const chartData = {
      labels: ['', '', '', '', '', ''],
      datasets: [{
        data: data,
        borderColor: color,
        backgroundColor: 'rgba(0,0,0,0)',
        borderWidth: 2,
        tension: 0.4,
        fill: false
      }]
    };

    return (
      <div style={{ width: '100%', height: '40px', marginTop: '8px' }}>
        <Line data={chartData} options={options} />
      </div>
    );
  };

  const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDepartment, setFilterDepartment] = useState("all");
    const { isAuthenticated } = useContext(Context);
    const [loading, setLoading] = useState(true);
    const [initialLoadTimePassed, setInitialLoadTimePassed] = useState(false);

    const [totalAccepted, setTotalAccepted] = useState(0);
    const [totalRejected, setTotalRejected] = useState(0);
    const [totalPending, setTotalPending] = useState(0);

    const [chartType, setChartType] = useState('gender'); // 'gender', 'age', 'department'

    useEffect(() => {
  const interval = setInterval(() => {
    setChartType(prev => {
      if (prev === 'gender') return 'age';
      if (prev === 'age') return 'department';
      return 'gender';
    });
  }, 4000); // Change every 5 seconds

  return () => clearInterval(interval);
}, []);

    useEffect(() => {
      const timer = setTimeout(() => {
        setInitialLoadTimePassed(true);
      }, 2000);

      const fetchDoctors = async () => {
        setLoading(true);
        try {
          const { data } = await axios.get(
            "https://jainam-hospital-backend.onrender.com/api/v1/user/doctors",
            { withCredentials: true }
          );
          const fetchedDoctors = data.doctors || [];
          setDoctors(fetchedDoctors);

          let accepted = 0;
          let rejected = 0;
          let pending = 0;
          fetchedDoctors.forEach(doc => {
            accepted += doc.acceptedCount || 0; 
            rejected += doc.rejectedCount || 0;
            pending += doc.pendingCount || 0;
          });
          setTotalAccepted(accepted);
          setTotalRejected(rejected);
          setTotalPending(pending);

        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to fetch doctors");
          setDoctors([]);
        } finally {
          setLoading(false);
        }
      };

      if (isAuthenticated) {
        fetchDoctors();
      } else {
        setLoading(false); 
      }
      return () => clearTimeout(timer);
    }, [isAuthenticated]);
    
    const showSkeleton = loading || !initialLoadTimePassed;

    const departments = useMemo(() => {
      return [...new Set(doctors.map(doctor => doctor.doctorDepartment).filter(Boolean))];
    }, [doctors]);

const filteredDoctors = useMemo(() => {
  return doctors.filter(doctor => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      `${doctor.firstName || ""} ${doctor.lastName || ""}`.toLowerCase().includes(searchLower) ||
      (doctor.email && doctor.email.toLowerCase().includes(searchLower)) ||
      (doctor.phone && String(doctor.phone).includes(searchTerm)) || // Convert to string first
      (doctor.nic && doctor.nic.toLowerCase().includes(searchLower));
    
    const matchesDepartment = filterDepartment === "all" || 
      doctor.doctorDepartment === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });
}, [doctors, searchTerm, filterDepartment]);

    const handleDeleteDoctor = async (doctorId) => {
      if (window.confirm("Are you sure you want to delete this doctor? This action cannot be undone.")) {
        try {
          await axios.delete(`https://jainam-hospital-backend.onrender.com/api/v1/user/doctor/delete/${doctorId}`, { withCredentials: true });
          setDoctors(prevDoctors => prevDoctors.filter(doc => doc._id !== doctorId));
          toast.success("Doctor deleted successfully");
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to delete doctor");
        }
      }
    };
    
    const exportToExcel = () => {
      const dataToExport = filteredDoctors.map(doctor => ({
        "Doctor Name": `Dr. ${doctor.firstName} ${doctor.lastName}`,
        "Department": doctor.doctorDepartment,
        "Email": doctor.email,
        "Phone": doctor.phone || "Not provided",
        "DOB": doctor.dob ? new Date(doctor.dob).toLocaleDateString() : "N/A",
        "Gender": doctor.gender || "N/A",
        "NIC": doctor.nic || "N/A"
      }));
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Doctors List");
      XLSX.writeFile(workbook, "Doctors_List.xlsx", { compression: true });
    };

    if (!isAuthenticated && !loading) {
      return <Navigate to={"/login"} />;
    }

    // Generate random data for mini charts
    const generateMiniChartData = (base) => {
      return Array.from({ length: 6 }, (_, i) => base + Math.random() * base * 0.3);
    };

    const appointmentStatusData = {
      labels: ['Accepted', 'Rejected', 'Pending'],
      datasets: [{
        label: 'Appointment Status',
        data: [totalAccepted, totalRejected, totalPending],
        backgroundColor: ['#4CAF50', '#F44336', '#FFC107'],
        borderColor: ['#388E3C', '#D32F2F', '#FFA000'],
        borderWidth: 1,
        hoverOffset: 10
      }]
    };

    const performanceData = {
      labels: filteredDoctors.length > 0 
        ? filteredDoctors.slice(0, 5).map(d => `Dr. ${d.firstName.charAt(0)}. ${d.lastName}`)
        : ["No Data"],
      datasets: [{
        label: 'Appointments Handled',
        data: filteredDoctors.length > 0 
          ? filteredDoctors.slice(0, 5).map(d => (d.acceptedCount || 0) + (d.pendingCount || 0))
          : [0],
        backgroundColor: 'rgba(77, 124, 254, 0.7)',
        borderColor: 'rgba(77, 124, 254, 1)',
        borderWidth: 1,
        borderRadius: 40
      }]
    };
    
    const trendsData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Accepted',
          data: [12, 19, 15, 25, 22, 23].map(d => Math.max(5, d + Math.floor(Math.random()*5))),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Rejected',
          data: [2, 3, 8, 5, 7, 4].map(d => Math.max(1, d + Math.floor(Math.random()*3))),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: true,
          tension: 0.4
        }
      ]
    };
    
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: 'top',
          labels: { 
            color: '#e0e0e0',
            padding: 15,
            font: {
              size: 12,
              weight: '500'
            },
            boxWidth: 12
          } 
        },
        tooltip: {
          backgroundColor: '#0f3460',
          titleColor: '#ffffff',
          bodyColor: '#e0e0e0',
          borderColor: '#4d7cfe',
          borderWidth: 1,
          padding: 12,
          boxPadding: 4,
          bodyFont: {
            size: 12
          },
          titleFont: {
            size: 13,
            weight: 'bold'
          }
        }
      },
      scales: {
        x: { 
          ticks: { color: '#adb5bd' }, 
          grid: { color: 'rgba(255,255,255,0.05)' } 
        },
        y: { 
          ticks: { color: '#adb5bd' }, 
          grid: { color: 'rgba(255,255,255,0.08)' },
          beginAtZero: true
        }
      }
    };

    const SkeletonRow = () => (
      <tr>
        <td><div className="skeleton skeleton-avatar"></div></td>
        <td><div className="skeleton skeleton-text"></div></td>
        <td><div className="skeleton skeleton-text"></div></td>
        <td><div className="skeleton skeleton-text"></div></td>
        <td><div className="skeleton skeleton-text"></div></td>
        <td><div className="skeleton skeleton-text"></div></td>
        <td><div className="skeleton skeleton-text"></div></td>
        <td><div className="skeleton skeleton-text"></div></td>
        <td><div className="skeleton skeleton-actions"></div></td>
      </tr>
    );

    // Function to get data for rotating charts based on chartType

    const getRotatingChartData = () => {
  if (chartType === 'gender') {
    const maleCount = doctors.filter(d => d.gender === 'Male').length;
    const femaleCount = doctors.filter(d => d.gender === 'Female').length;
    const otherCount = doctors.length - maleCount - femaleCount;
    
    return {
      labels: ['Male', 'Female', 'Other'],
      datasets: [{
        data: [maleCount, femaleCount, otherCount],
        backgroundColor: ['#4d7cfe', '#ff6b9d', '#9c27b0'],
        borderColor: ['#3a6aed', '#e91e63', '#7b1fa2'],
        borderWidth: 1
      }]
    };
  }

  if (chartType === 'age') {
    // Group doctors by age ranges
    const ageRanges = {
      '20-30': 0,
      '31-40': 0,
      '41-50': 0,
      '51+': 0
    };
    
    doctors.forEach(doctor => {
      if (doctor.dob) {
        const age = new Date().getFullYear() - new Date(doctor.dob).getFullYear();
        if (age <= 30) ageRanges['20-30']++;
        else if (age <= 40) ageRanges['31-40']++;
        else if (age <= 50) ageRanges['41-50']++;
        else ageRanges['51+']++;
      }
    });
    
    return {
      labels: Object.keys(ageRanges),
      datasets: [{
        data: Object.values(ageRanges),
        backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#F44336'],
        borderColor: ['#388E3C', '#1976D2', '#FFA000', '#D32F2F'],
        borderWidth: 1
      }]
    };
  }

  // Department distribution
  const departmentCounts = {};
  doctors.forEach(doctor => {
    const dept = doctor.doctorDepartment || 'Unknown';
    departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
  });
  
  const sortedDepartments = Object.entries(departmentCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // Top 5 departments
  
  return {
    labels: sortedDepartments.map(d => d[0]),
    datasets: [{
      data: sortedDepartments.map(d => d[1]),
      backgroundColor: ['#4d7cfe', '#4CAF50', '#FFC107', '#F44336', '#9c27b0'],
      borderColor: ['#3a6aed', '#388E3C', '#FFA000', '#D32F2F', '#7b1fa2'],
      borderWidth: 1
    }]
  };
};

    return (
      <div className="doctors-dashboard-container">
        {/* Metrics Bar */}
        <div className="metrics-bar">
          <div className="metric-card">
            <div className="metric-top">
              <FaUsers className="metric-icon" />
              <div className="metric-info">
                <h4>Total Doctors</h4>
                <p>{doctors.length}</p>
              </div>
            </div>
            <MiniLineChart 
              data={generateMiniChartData(doctors.length)} 
              color="#4d7cfe" 
            />
          </div>
          <div className="metric-card">
            <div className="metric-top">
              <FaUserCheck className="metric-icon accepted" />
              <div className="metric-info">
                <h4>Accepted Appointments</h4>
                <p>{totalAccepted}</p>
              </div>
            </div>
            <MiniLineChart 
              data={generateMiniChartData(totalAccepted)} 
              color="#4CAF50" 
            />
          </div>
          <div className="metric-card">
            <div className="metric-top">
              <FaUserTimes className="metric-icon rejected" />
              <div className="metric-info">
                <h4>Rejected Appointments</h4>
                <p>{totalRejected}</p>
              </div>
            </div>
            <MiniLineChart 
              data={generateMiniChartData(totalRejected)} 
              color="#F44336" 
            />
          </div>
          <div className="metric-card">
            <div className="metric-top">
              <FaUserClock className="metric-icon pending" />
              <div className="metric-info">
                <h4>Pending Appointments</h4>
                <p>{totalPending}</p>
              </div>
            </div>
            <MiniLineChart 
              data={generateMiniChartData(totalPending)} 
              color="#FFC107" 
            />
          </div>
        </div>
        {/* Analytics Section */}
        {!showSkeleton && doctors.length > 0 && (
          <div className="graphs-section">
            <h3 className="section-title">Analytics & Performance</h3>
            <div className="charts-grid">
              <div className="chart-container">
                <h4 className="chart-title">Appointment Status Distribution</h4>
                <div className="chart-wrapper">
                  <Doughnut 
                    data={appointmentStatusData} 
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          ...chartOptions.plugins.legend,
                          position: 'right'
                        }
                      }
                    }} 
                  />
                </div>
              </div>
              <div className="chart-container">
                <h4 className="chart-title">Top Doctor Performance</h4>
                <div className="chart-wrapper">
                  <Bar 
                    data={performanceData} 
                    options={chartOptions} 
                  />
                </div>
              </div>
               <div className="chart-container">
    <h4 className="chart-title">
      {chartType === 'gender' && 'Gender Distribution'}
      {chartType === 'age' && 'Age Distribution'}
      {chartType === 'department' && 'Top Departments'}
    </h4>
    <div className="chart-wrapper">
      <Doughnut 
        data={getRotatingChartData()} 
        options={{
          ...chartOptions,
          plugins: {
            ...chartOptions.plugins,
            legend: {
              ...chartOptions.plugins.legend,
              position: 'right'
            }
          }
        }} 
      />
    </div>
  </div>
              <div className="chart-container full-width-chart">
                <h4 className="chart-title">Monthly Appointment Trends</h4>
                <div className="chart-wrapper" style={{height: '350px'}}>
                  <Line 
                    data={trendsData} 
                    options={{
                      ...chartOptions,
                      interaction: {
                        mode: 'index',
                        intersect: false
                      },
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          ...chartOptions.plugins.legend,
                          position: 'top'
                        }
                      }
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="doctors-main-content">
          <div className="page-header">
            <div className="header-title-group">
              <GiDoctorFace className="header-main-icon" />
              <div className="header-text">
                <h2>Hospital Medical Staff</h2>
                <p>Manage doctor profiles, performance, and records.</p>
              </div>
            </div>
            <div className="controls">
              <div className={`search-box ${searchTerm ? 'active' : ''}`}>
                <FiSearch />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, NIC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    className="clear-search" 
                    onClick={() => setSearchTerm('')}
                  >
                    &times;
                  </button>
                )}
              </div>
              <div className="filter-box">
                <FiFilter />
                <select 
                  value={filterDepartment} 
                  onChange={(e) => setFilterDepartment(e.target.value)}
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <button 
                className="export-btn" 
                onClick={exportToExcel} 
                disabled={showSkeleton || filteredDoctors.length === 0}
              >
                <FiDownload /> Export Excel
              </button>
            </div>
          </div>

          <div className="table-container">
            {showSkeleton ? (
              <table>
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>DOB</th>
                    <th>Gender</th>
                    <th>NIC</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                </tbody>
              </table>
            ) : filteredDoctors.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>DOB</th>
                    <th>Gender</th>
                    <th>NIC</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.map((doctor) => (
                    <tr key={doctor._id}>
                      <td>
                        <img 
                          src={doctor.docAvatar?.url || "/default-doctor.jpg"} 
                          alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                          className="doctor-table-avatar"
                          onError={(e) => { e.target.onerror = null; e.target.src = "/default-doctor.jpg";}}
                        />
                      </td>
                      <td>Dr. {doctor.firstName} {doctor.lastName}</td>
                      <td>{doctor.doctorDepartment || "N/A"}</td>
                      <td>{doctor.email}</td>
                      <td>{doctor.phone || "N/A"}</td>
                      <td>{doctor.dob ? new Date(doctor.dob).toLocaleDateString() : "N/A"}</td>
                      <td>{doctor.gender || "N/A"}</td>
                      <td>{doctor.nic || "N/A"}</td>
                      <td>
                        <button 
                          onClick={() => handleDeleteDoctor(doctor._id)} 
                          className="action-btn delete"
                          title="Delete Doctor"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <NotFoundDisplay />
            )}
          </div>
        </div>
        
        

        <style jsx="true">{`
          .doctors-dashboard-container {
            background-color: #1a1a2e;
            color: #e0e0e0;
            min-height: 100vh;
            padding: 1.5rem 2rem;
            margin-left: 270px;
            font-family: 'Roboto', 'Segoe UI', sans-serif;
          }

          .metrics-bar {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2.5rem;
          }
          .metric-card {
            background: linear-gradient(145deg, #1e2a4a, #16213e);
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          .metric-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(77, 124, 254, 0.15);
          }
          .metric-top {
            display: flex;
            align-items: center;
            gap: 1.25rem;
            margin-bottom: 0.5rem;
          }
          .metric-icon {
            font-size: 2.5rem;
            color: #4d7cfe;
          }
          .metric-icon.accepted { color: #4CAF50; }
          .metric-icon.rejected { color: #F44336; }
          .metric-icon.pending { color: #FFC107; }

          .metric-info h4 {
            margin: 0 0 0.3rem 0;
            color: #bac8dc;
            font-size: 0.85rem;
            font-weight: 500;
            text-transform: uppercase;
          }
          .metric-info p {
            margin: 0;
            font-size: 1.7rem;
            font-weight: 700;
            color: #ffffff;
          }

          .doctors-main-content {
            background-color: #16213e;
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
          }
          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 2rem;
            flex-wrap: wrap;
            gap: 1.5rem;
          }
          .header-title-group {
            display: flex;
            align-items: center;
            gap: 1rem;
          }
          .header-main-icon {
            font-size: 2.8rem;
            color: #4d7cfe;
            padding: 0.5rem;
            background-color: rgba(77, 124, 254, 0.1);
            border-radius: 8px;
          }
          .header-text h2 {
            color: #ffffff;
            margin: 0;
            font-size: 1.8rem;
            font-weight: 600;
          }
          .header-text p {
            color: #adb5bd;
            margin: 0.25rem 0 0 0;
            font-size: 0.95rem;
          }
          .controls {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            align-items: center;
          }
          .search-box {
            display: flex;
            align-items: center;
            background-color: #0f3460;
            border-radius: 8px;
            padding: 0.6rem 0.8rem;
            border: 1px solid #3a4a6b;
            position: relative;
            transition: all 0.2s ease;
          }
          .search-box.active {
            border-color: #4d7cfe;
            box-shadow: 0 0 0 2px rgba(77, 124, 254, 0.2);
          }
          .search-box input {
            background: transparent;
            border: none;
            outline: none;
            color: #e0e0e0;
            font-size: 0.9rem;
            margin-left: 0.5rem;
            width: 220px;
            padding-right: 25px;
          }
          .clear-search {
            position: absolute;
            right: 8px;
            background: none;
            border: none;
            color: #7a8b9e;
            cursor: pointer;
            font-size: 1.2rem;
            padding: 0 5px;
            transition: color 0.2s;
          }
          .clear-search:hover {
            color: #e0e0e0;
          }
          .filter-box {
            display: flex;
            align-items: center;
            background-color: #0f3460;
            border-radius: 8px;
            padding: 0.6rem 0.8rem;
            border: 1px solid #3a4a6b;
          }
          .filter-box select {
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            cursor: pointer;
            padding-right: 1.5rem;
            background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20fill%3D%22%237a8b9e%22%20d%3D%22M5%208l5%205%205-5z%22%2F%3E%3C%2Fsvg%3E');
            background-repeat: no-repeat;
            background-position: right 0.5rem center;
            background: transparent;
            border: none;
            outline: none;
            color: #e0e0e0;
            font-size: 0.9rem;
            margin-left: 0.5rem;
          }
          .filter-box select option {
            background-color: #16213e;
            color: #e0e0e0;
          }
          .search-box svg, .filter-box svg {
            color: #7a8b9e;
          }
          .export-btn {
            background-color: #4d7cfe;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0.7rem 1.2rem;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: background-color 0.2s ease;
          }
          .export-btn:hover:not(:disabled) {
            background-color: #3a6aed;
          }
          .export-btn:disabled {
            background-color: #3a4a6b;
            cursor: not-allowed;
            opacity: 0.7;
          }
          
          .table-container {
            overflow-x: auto;
          
          
            
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
            color: #e0e0e0;
          }
          th, td {
            padding: 0.9rem 1rem;
            text-align: left;
            border-bottom: 1px solid #2c3e50;
            font-size: 0.9rem;
            white-space: nowrap;
          }
          th {
            background-color: #1f2b4a;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.8rem;
            letter-spacing: 0.5px;
            color: #bac8dc;
          }
          tbody tr:hover {
            background-color: rgba(31, 43, 74, 0.7);
          }
          .doctor-table-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #3a4a6b;
          }
          .action-btn {
            background: none;
            border: none;
            color: #adb5bd;
            cursor: pointer;
            padding: 0.4rem;
            border-radius: 4px;
            transition: color 0.2s, background-color 0.2s;
          }
          .action-btn.delete:hover {
            color: #F44336;
            background-color: rgba(244, 67, 54, 0.1);
          }
          .action-btn svg { font-size: 1.1rem; }

          .graphs-section {
            margin-top: 2.5rem;
            padding: 1rem;
          
          
          }
          .section-title {
            color: #ffffff;
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid #3a4a6b;
          }
          .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
          }
          .chart-container {
            background-color: #0f3460;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: transform 0.2s ease;
          }
          .chart-container:hover {
            transform: translateY(-3px);
          }
          .chart-title {
            color: #e0e0e0;
            text-align: center;
            margin-bottom: 1rem;
            font-size: 1.1rem;
            font-weight: 500;
          }
          .chart-wrapper {
            height: 300px;
            position: relative;
          }
          .full-width-chart {
            grid-column: 1 / -1;
          }
          .full-width-chart .chart-wrapper {
            height: 350px;
          }

          /* Skeleton Loading Styles */
          .skeleton {
            background-color: #2c3e50;
            background-image: linear-gradient(
              90deg,
              #2c3e50,
              #3a4a6b,
              #2c3e50
            );
            background-size: 200px 100%;
            background-repeat: no-repeat;
            border-radius: 4px;
            animation: shimmer 1.5s infinite linear;
            opacity: 0.7;
          }
          .skeleton-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
          }
          .skeleton-text {
            width: 80%;
            height: 1em;
            margin-bottom: 0.5em;
          }
          td .skeleton-text { width: 100%; height: 1.2em; margin-bottom: 0;}
          .skeleton-actions { width: 40px; height: 1.5em; }

          @keyframes shimmer {
            0% { background-position: -200px 0; }
            100% { background-position: calc(200px + 100%) 0; }
          }

          @media (max-width: 1399px) {
            .doctors-dashboard-container {
              margin-left: 0;
              padding: 1rem 1.5rem;
            }
          }
          @media (max-width: 992px) {
            .metrics-bar {
              grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
              gap: 1rem;
            }
            .metric-info p { font-size: 1.4rem; }
            .metric-icon { font-size: 2rem; }

            .page-header {
              flex-direction: column;
              align-items: stretch;
            }
            .controls {
              flex-direction: column;
              align-items: stretch;
            }
            .search-box input { 
              width: 100%; 
              box-sizing: border-box; 
            }
            .filter-box, .search-box, .export-btn { 
              width: 100%; 
              box-sizing: border-box; 
            }
            .filter-box select { width: 100%; }

            .charts-grid {
              grid-template-columns: 1fr;
            }
          }
          @media (max-width: 768px) {
            .header-text h2 { font-size: 1.5rem; }
            .header-text p { font-size: 0.9rem; }
            .doctors-main-content, .graphs-section { padding: 1.5rem; }
            th, td { padding: 0.7rem 0.5rem; font-size: 0.85rem;}
            .doctor-table-avatar { width: 30px; height: 30px;}
            .action-btn svg { font-size: 1rem; }
          }
          @media (max-width: 576px) {
            .doctors-dashboard-container { padding: 1rem; }
            .metrics-bar { grid-template-columns: 1fr; }
            .metric-card { flex-direction: column; }
            .metric-top { margin-bottom: 1rem; }
            .chart-wrapper, .full-width-chart .chart-wrapper { height: 250px; }
          }
        `}</style>
      </div>
    );
  };

  export default Doctors;