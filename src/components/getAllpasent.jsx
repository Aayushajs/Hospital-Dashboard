import React, { useState, useEffect, useContext } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FiUser, FiUsers, FiCalendar, FiClock, FiMail, FiPhone, FiSearch } from "react-icons/fi";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { FaIndianRupeeSign } from "react-icons/fa6";
import Lottie from "lottie-react";
import animationData from "../../public/notfountAnimation.json";
import loadingAnimation from "../../public/loding.json"; // Add your loading animation Lottie file

Chart.register(...registerables);

const PatientsDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    male: 0,
    female: 0,
    totalAppointments: 0,
    totalFees: 0
  });
  const { isAuthenticated } = useContext(Context);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patients and appointments data in parallel
        const [patientsRes, appointmentsRes] = await Promise.all([
          axios.get(
            "https://jainam-hospital-backend.onrender.com/api/v1/user/getAllPatiens",
            { withCredentials: true }
          ),
          axios.get(
            "https://jainam-hospital-backend.onrender.com/api/v1/appointment/getall",
            { withCredentials: true }
          )
        ]);

        setPatients(patientsRes.data.patients);
        setAppointments(appointmentsRes.data.appointments);

        // Calculate statistics
        const maleCount = patientsRes.data.patients.filter(p => p.gender === 'Male').length;
        const femaleCount = patientsRes.data.patients.filter(p => p.gender === 'Female').length;
        const totalFees = appointmentsRes.data.appointments.reduce(
          (sum, app) => sum + (app.fees || 0), 0
        );

        // Calculate age distribution
        const ageGroups = { "0-18": 0, "19-30": 0, "31-45": 0, "46-60": 0, "60+": 0 };
        const registrationYears = {};
        const currentYear = new Date().getFullYear();

        patientsRes.data.patients.forEach(patient => {
          // Calculate age
          if (patient.dob) {
            const dob = new Date(patient.dob);
            const age = new Date().getFullYear() - dob.getFullYear();
            
            if (age <= 18) ageGroups["0-18"]++;
            else if (age <= 30) ageGroups["19-30"]++;
            else if (age <= 45) ageGroups["31-45"]++;
            else if (age <= 60) ageGroups["46-60"]++;
            else ageGroups["60+"]++;
          }
          
          // Calculate registration year
          if (patient.createdAt) {
            const year = new Date(patient.createdAt).getFullYear();
            registrationYears[year] = (registrationYears[year] || 0) + 1;
          }
        });

        // Prepare registration by year data (last 5 years)
        const registrationByYearLabels = [];
        const registrationByYearData = [];
        
        for (let year = currentYear - 4; year <= currentYear; year++) {
          registrationByYearLabels.push(year.toString());
          registrationByYearData.push(registrationYears[year] || 0);
        }

        setStats({
          total: patientsRes.data.count,
          male: maleCount,
          female: femaleCount,
          totalAppointments: appointmentsRes.data.appointments.length,
          totalFees,
          ageGroups: Object.values(ageGroups),
          registrationByYear: {
            labels: registrationByYearLabels,
            data: registrationByYearData
          }
        });

        setLoading(false);
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  // Get appointment details for a patient
  const getPatientAppointmentDetails = (patientId) => {
    const patientApps = appointments
      .filter(app => app.patientId === patientId)
      .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));
    
    if (patientApps.length === 0) {
      return {
        firstAppointment: null,
        lastAppointment: null,
        totalFees: 0
      };
    }
    
    return {
      firstAppointment: patientApps[0].appointment_date,
      lastAppointment: patientApps[patientApps.length - 1].appointment_date,
      totalFees: patientApps.reduce((sum, app) => sum + (app.fees || 0), 0)
    };
  };

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => {
    const searchContent = `${patient.firstName} ${patient.lastName} ${patient.email} ${patient.phone} ${patient.gender}`.toLowerCase();
    return searchContent.includes(searchTerm.toLowerCase());
  });

  // Chart data configurations
  const chartData = {
    ageDistribution: {
      labels: ["0-18", "19-30", "31-45", "46-60", "60+"],
      datasets: [{
        label: "Patients by Age",
        data: stats.ageGroups || [0, 0, 0, 0, 0],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
        fill: true
      }]
    },
    registrationByYear: {
      labels: stats.registrationByYear?.labels || [],
      datasets: [{
        label: "Registrations",
        data: stats.registrationByYear?.data || [],
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1
      }]
    },
    genderDistribution: {
      labels: ["Male", "Female"],
      datasets: [{
        data: [stats.male, stats.female],
        backgroundColor: ["rgba(54, 162, 235, 0.7)", "rgba(255, 99, 132, 0.7)"],
        borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1
      }]
    }
  };

  // Chart options
  const chartOptions = {
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#e9ecef' }
      },
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#e9ecef' }
      }
    },
    plugins: {
      legend: {
        labels: { color: '#e9ecef' }
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Lottie 
          animationData={loadingAnimation} 
          style={{ overflow:"hidden",height: 400, width: 400, marginLeft: "10%" }}
        />
        <p>Loading patient data...</p>
        
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background-color: #1a1a2e;
            color: #e9ecef;
          }
          
          .loading-container p {
            margin-top: -5rem;
            font-size: 1.2rem;
            margin-left: 10%;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h2>Patients Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="stats-grid">
        {[
          { icon: <FiUsers />, value: stats.total, label: "Total Patients", className: "total" },
          { icon: <FiUser />, value: stats.male, label: "Male Patients", className: "male" },
          { icon: <FiUser />, value: stats.female, label: "Female Patients", className: "female" },
          { icon: <FiClock />, value: stats.totalAppointments, label: "Total Appointments", className: "appointments" },
          { icon: <FaIndianRupeeSign />, value: `₹${stats.totalFees.toLocaleString()}`, label: "Total Fees", className: "fees" }
        ].map((stat, index) => (
          <div key={index} className={`stat-card ${stat.className}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-card">
          <h4>Patient Age Distribution</h4>
          <div className="chart-container">
            <Line data={chartData.ageDistribution} options={chartOptions} />
          </div>
        </div>
        
        <div className="chart-card">
          <h4>Registration by Year</h4>
          <div className="chart-container">
            <Bar data={chartData.registrationByYear} options={chartOptions} />
          </div>
        </div>
        
        <div className="chart-card">
          <h4>Gender Distribution</h4>
          <div className="chart-container">
            <Pie data={chartData.genderDistribution} options={chartOptions} />
          </div>
        </div>
      </div>
      
      {/* Patients Table with Search */}
      <div className="patients-table">
        <div className="table-header">
          <h3>Patients List</h3>
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Patient Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Gender</th>
                <th>Age</th>
                <th>Appointments</th>
                <th>Total Fees</th>
                <th>First Appointment</th>
                <th>Last Appointment</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient, index) => {
                  const dob = patient.dob ? new Date(patient.dob) : null;
                  const age = dob ? new Date().getFullYear() - dob.getFullYear() : 'N/A';
                  const { firstAppointment, lastAppointment, totalFees } = getPatientAppointmentDetails(patient._id);
                  
                  return (
                    <tr key={patient._id}>
                      <td>{index + 1}</td>
                      <td className="patient-name">{patient.firstName} {patient.lastName}</td>
                      <td>
                        <div className="email-cell">
                          <FiMail className="icon" /> {patient.email}
                        </div>
                      </td>
                      <td>
                        <div className="phone-cell">
                          <FiPhone className="icon" /> {patient.phone}
                        </div>
                      </td>
                      <td>{patient.gender}</td>
                      <td>{age}</td>
                      <td>{patient.appointmentCount || 0}</td>
                      <td className="fees-amount">
                        <FaIndianRupeeSign />{totalFees.toLocaleString()}
                      </td>
                      <td>
                        {firstAppointment ? new Date(firstAppointment).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        {lastAppointment ? new Date(lastAppointment).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="no-data">
                    <div className="empty-state">
                      <Lottie 
                        animationData={animationData} 
                        style={{ height: 200, width: 200, overflow: 'hidden' }} 
                      />
                      <p>No patients found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .dashboard-container {
          background-color: #1a1a2e;
          color: #e9ecef;
          min-height: 100vh;
          padding: 1.5rem;
          margin-left: 270px;
        }
        
        .dashboard-container h2, .dashboard-container h3 {
          color: white;
          margin-bottom: 1.5rem;
        }
        
        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .stat-card {
          background-color: #16213e;
          border-radius: 10px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          transition: transform 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
        }
        
        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-right: 1rem;
        }
        
        .total .stat-icon { background-color: rgba(13, 110, 253, 0.2); color: #0d6efd; }
        .male .stat-icon { background-color: rgba(54, 162, 235, 0.2); color: #36a2eb; }
        .female .stat-icon { background-color: rgba(255, 99, 132, 0.2); color: #ff6384; }
        .appointments .stat-icon { background-color: rgba(255, 193, 7, 0.2); color: #ffc107; }
        .fees .stat-icon { background-color: rgba(40, 167, 69, 0.2); color: #28a745; }
        
        .stat-info h3 {
          margin: 0;
          color: white;
          font-size: 1.5rem;
        }
        
        .stat-info p {
          margin: 0.25rem 0 0;
          color: #adb5bd;
          font-size: 0.9rem;
        }
        
        /* Charts Grid */
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .chart-card {
          background-color: #16213e;
          border-radius: 10px;
          padding: 1.5rem;
        }
        
        .chart-container {
          height: 250px;
          position: relative;
        }
        
        /* Patients Table */
        .patients-table {
          background-color: #16213e;
          border-radius: 10px;
          padding: 1.5rem;
        }
        
        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .search-container {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .search-icon {
          position: absolute;
          left: 10px;
          color: #adb5bd;
        }
        
        .search-container input {
          padding: 0.5rem 1rem 0.5rem 2rem;
          border-radius: 20px;
          border: 1px solid #3a4a6b;
          background-color: #0f3460;
          color: white;
          font-size: 0.9rem;
          min-width: 250px;
        }
        
        .search-container input:focus {
          outline: none;
          border-color: #4d7cfe;
        }
        
        .table-container {
          overflow-x: auto;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }
        
        th {
          background-color: #0f3460;
          color: white;
          padding: 0.75rem;
          text-align: left;
          font-weight: 500;
        }
        
        td {
          padding: 0.75rem;
          border-bottom: 1px solid #2d3748;
          vertical-align: middle;
        }
        
        .patient-name {
          font-weight: 500;
          color: white;
        }
        
        .email-cell, .phone-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .fees-amount {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        
        .no-data {
          padding: 1rem;
        }
        
        .empty-state {
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        
        .empty-state p {
          color: #6c757d;
          margin-top: 1rem;
        }
        
        /* Responsive Adjustments */
        @media (max-width: 1200px) {
          .dashboard-container {
            margin-left: 0;
          }
          
          table {
            min-width: 1100px;
          }
        }
        
        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1rem;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .table-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .search-container {
            width: 100%;
          }
          
          .search-container input {
            width: 100%;
          }
        }
        
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .chart-card {
            padding: 1rem;
          }
          
          .chart-container {
            height: 200px;
          }
        
        }
      `}</style>
    </div>
  );
};

export default PatientsDashboard;