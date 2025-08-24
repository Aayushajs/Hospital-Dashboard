import { API_BASE_URL } from "../api";
import React, { useState, useEffect, useContext } from "react";
import { Context } from "../main";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FiFileText, FiDollarSign, FiUser,FiSearch, FiChevronDown, FiChevronUp, FiDownload, FiEye } from "react-icons/fi";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import Lottie from "lottie-react";
import animationData from "../../public/notfountAnimation.json";
import loadingAnimation from "../../public/loding.json";
import FloatingCalculatorButton from "./FloatingButton"; // Import the FloatingCalculatorButton component

Chart.register(...registerables);

const DescriptionsDashboard = () => {
  const [descriptions, setDescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    unpaid: 0,
    paid: 0,
    totalFees: 0,
    consultationFees: 0,
    medicationFees: 0
  });
  const { isAuthenticated } = useContext(Context);
  const navigate = useNavigate();

    const viewFullDescription = (description) => {
    navigate('/description-bill', { state: { description } });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/descriptions/admin/filter`,
          { withCredentials: true }
        );

        setDescriptions(response.data.descriptions);

        // Calculate statistics
        const unpaidCount = response.data.descriptions.filter(d => d.paymentStatus === 'Unpaid').length;
        const paidCount = response.data.descriptions.filter(d => d.paymentStatus === 'Paid').length;
        const totalFees = response.data.descriptions.reduce(
          (sum, desc) => sum + (desc.fee?.totalFee || 0), 0
        );
        const consultationFees = response.data.descriptions.reduce(
          (sum, desc) => sum + (desc.fee?.consultationFee || 0), 0
        );
        const medicationFees = response.data.descriptions.reduce(
          (sum, desc) => sum + (desc.fee?.medicationFee || 0), 0
        );

        // Calculate department distribution
        const departmentData = {};
        const paymentByMonth = {};
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();

        response.data.descriptions.forEach(desc => {
          // Department distribution
          const dept = desc.doctorId?.doctorDepartment || 'Unknown';
          departmentData[dept] = (departmentData[dept] || 0) + 1;
          
          // Payment by month
          if (desc.date) {
            const date = new Date(desc.date);
            const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
            paymentByMonth[monthYear] = (paymentByMonth[monthYear] || 0) + (desc.fee?.totalFee || 0);
          }
        });

        // Prepare payment by month data (last 6 months)
        const paymentByMonthLabels = [];
        const paymentByMonthData = [];
        
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(currentMonth - i);
          const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
          const monthName = date.toLocaleString('default', { month: 'short' });
          
          paymentByMonthLabels.push(`${monthName} ${date.getFullYear()}`);
          paymentByMonthData.push(paymentByMonth[monthYear] || 0);
        }

        setStats({
          total: response.data.count,
          unpaid: unpaidCount,
          paid: paidCount,
          totalFees,
          consultationFees,
          medicationFees,
          departments: Object.entries(departmentData).map(([name, value]) => ({ name, value })),
          paymentByMonth: {
            labels: paymentByMonthLabels,
            data: paymentByMonthData
          }
        });

        setLoading(false);
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching descriptions");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleRow = (id) => {
    if (expandedRows.includes(id)) {
      setExpandedRows(expandedRows.filter(rowId => rowId !== id));
    } else {
      setExpandedRows([...expandedRows, id]);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }
 // Function to download PDF
    const downloadPdf = async (descriptionId) => {
    try {
      // Create a temporary anchor tag to trigger the download
      const link = document.createElement('a');
  link.href = `${API_BASE_URL}/api/v1/descriptions/${descriptionId}/pdf`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
      
      toast.success("PDF download started");
    } catch (error) {
      toast.error("Failed to download PDF");
      console.error("PDF download error:", error);
    }
  };

  // Filter descriptions based on search term
  const filteredDescriptions = descriptions.filter(desc => {
    const searchContent = `${desc.patientId?.firstName || ''} ${desc.patientId?.lastName || ''} 
      ${desc.doctorId?.firstName || ''} ${desc.doctorId?.lastName || ''} 
      ${desc.diagnosis || ''} ${desc.paymentStatus || ''}`.toLowerCase();
    return searchContent.includes(searchTerm.toLowerCase());
  });

  // Chart data configurations
  const chartData = {
    departmentDistribution: {
      labels: stats.departments?.map(d => d.name) || [],
      datasets: [{
        label: "Descriptions by Department",
        data: stats.departments?.map(d => d.value) || [],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
        fill: true
      }]
    },
    paymentByMonth: {
      labels: stats.paymentByMonth?.labels || [],
      datasets: [{
        label: "Revenue (₹)",
        data: stats.paymentByMonth?.data || [],
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1
      }]
    },
    paymentStatus: {
      labels: ["Paid", "Unpaid"],
      datasets: [{
        data: [stats.paid, stats.unpaid],
        backgroundColor: ["rgba(40, 167, 69, 0.7)", "rgba(220, 53, 69, 0.7)"],
        borderColor: ["rgba(40, 167, 69, 1)", "rgba(220, 53, 69, 1)"],
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

  const handleRowClick = (description) => {
    navigate('/description-details', { state: { description } });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Lottie 
          animationData={loadingAnimation} 
          style={{ overflow:"hidden",height: 400, width: 400, marginLeft: "10%" }}
        />
        <p>Loading medical descriptions...</p>
        
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
        <FloatingCalculatorButton/>
      <h2>Medical Descriptions Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="stats-grid">
        {[
          { icon: <FiFileText />, value: stats.total, label: "Total Descriptions", className: "total" },
          { icon: <FiDollarSign />, value: `₹${stats.totalFees.toLocaleString()}`, label: "Total Revenue", className: "fees" },
          { icon: <FiUser />, value: stats.paid, label: "Paid Descriptions", className: "paid" },
          { icon: <FiUser />, value: stats.unpaid, label: "Unpaid Descriptions", className: "unpaid" },
          { icon: <FaIndianRupeeSign />, value: `₹${stats.consultationFees.toLocaleString()}`, label: "Consultation Fees", className: "consultation" },
          { icon: <FaIndianRupeeSign />, value: `₹${stats.medicationFees.toLocaleString()}`, label: "Medication Fees", className: "medication" }
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
          <h4>Descriptions by Department</h4>
          <div className="chart-container">
            <Line data={chartData.departmentDistribution} options={chartOptions} />
          </div>
        </div>
        
        <div className="chart-card">
          <h4>Revenue by Month (₹)</h4>
          <div className="chart-container">
            <Bar data={chartData.paymentByMonth} options={chartOptions} />
          </div>
        </div>
        
        <div className="chart-card">
          <h4>Payment Status</h4>
          <div className="chart-container">
            <Pie data={chartData.paymentStatus} options={chartOptions} />
          </div>
        </div>
      </div>
      
      {/* Descriptions Table with Search */}
      <div className="descriptions-table">
        <div className="table-header">
          <h3>Medical Descriptions</h3>
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Department</th>
                <th>Diagnosis</th>
                <th>Total Fee</th>
                <th>Payment Status</th>
                <th>Date</th>
                <th>View</th>
              </tr>
            </thead>
              <tbody>
            {filteredDescriptions.length > 0 ? (
              filteredDescriptions.map((desc, index) => (
                <React.Fragment key={desc._id}>
                  <tr onClick={() => toggleRow(desc._id)} className="clickable-row">
                    <td>
                      {expandedRows.includes(desc._id) ? <FiChevronUp /> : <FiChevronDown />}
                    </td>
                    <td className="patient-name">
                      {desc.patientId?.firstName} {desc.patientId?.lastName}
                    </td>
                    <td>
                      {desc.doctorId?.firstName} {desc.doctorId?.lastName}
                    </td>
                    <td>{desc.doctorId?.doctorDepartment || 'N/A'}</td>
                    <td>{desc.diagnosis || 'N/A'}</td>
                    <td className="fees-amount">
                      <FaIndianRupeeSign />{desc.fee?.totalFee?.toLocaleString() || '0'}
                    </td>
                    <td>
                      <span className={`status-badge ${desc.paymentStatus === 'Paid' ? 'paid' : 'unpaid'}`}>
                        {desc.paymentStatus}
                      </span>
                    </td>
                    <td>
                      {desc.date ? new Date(desc.date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          viewFullDescription(desc);
                        }}
                        className="view-button"
                      >
                        <FiEye /> View
                      </button>
                    </td>
                  </tr>
                      {expandedRows.includes(desc._id) && (
            <tr className="expanded-row">
              <td colSpan="9">
                <div className="expanded-content">
                  <div className="expanded-section">
                    <div className="section-header">
                      <h4>Patient Details</h4>
                      <button 
                        onClick={() => downloadPdf(desc._id)}
                        className="download-pdf-btn"
                      >
                        <FiDownload /> Download PDF
                      </button>
                    </div>
                    <div className="details-grid">
                      <div>
                        <span className="detail-label">Name:</span>
                        <span>{desc.patientId?.firstName} {desc.patientId?.lastName}</span>
                      </div>
                      {/* <div>
                        <span className="detail-label">Patient ID:</span>
                        <span>{desc.patientId?._id}</span>
                      </div> */}
                    </div>
                  </div>


                              <div className="expanded-section">
                                <h4>Doctor Details</h4>
                                <div className="details-grid">
                                  <div>
                                    <span className="detail-label">Name:</span>
                                    <span>{desc.doctorId?.firstName} {desc.doctorId?.lastName}</span>
                                  </div>
                                  <div>
                                    <span className="detail-label">Department:</span>
                                    <span>{desc.doctorId?.doctorDepartment}</span>
                                  </div>
                                  {/* <div>
                                    <span className="detail-label">Doctor ID:</span>
                                    <span>{desc.doctorId?._id}</span>
                                  </div> */}
                                </div>
                              </div>

                              <div className="expanded-section">
                                <h4>Medical Information</h4>
                                <div className="details-grid">
                                  <div>
                                    <span className="detail-label">Diagnosis:</span>
                                    <span>{desc.diagnosis}</span>
                                  </div>
                                  <div>
                                    <span className="detail-label">ICD Code:</span>
                                    <span>{desc.icdCode}</span>
                                  </div>
                                  <div>
                                    <span className="detail-label">Symptoms:</span>
                                    <span>{desc.symptoms?.join(', ')}</span>
                                  </div>
                                  <div>
                                    <span className="detail-label">Clinical Notes:</span>
                                    <span>{desc.clinicalNotes}</span>
                                  </div>
                                  <div>
                                    <span className="detail-label">Follow-up Instructions:</span>
                                    <span>{desc.followUpInstructions}</span>
                                  </div>
                                  <div>
                                    <span className="detail-label">Next Visit:</span>
                                    <span>{desc.nextVisit ? new Date(desc.nextVisit).toLocaleDateString() : 'N/A'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="expanded-section">
                                <h4>Vital Signs</h4>
                                <div className="details-grid">
                                  <div>
                                    <span className="detail-label">Blood Pressure:</span>
                                    <span>{desc.vitalSigns?.bloodPressure}</span>
                                  </div>
                                  <div>
                                    <span className="detail-label">Pulse:</span>
                                    <span>{desc.vitalSigns?.pulse} bpm</span>
                                  </div>
                                  <div>
                                    <span className="detail-label">Temperature:</span>
                                    <span>{desc.vitalSigns?.temperature} °F</span>
                                  </div>
                                  <div>
                                    <span className="detail-label">Height:</span>
                                    <span>{desc.vitalSigns?.height} cm</span>
                                  </div>
                                  <div>
                                    <span className="detail-label">Weight:</span>
                                    <span>{desc.vitalSigns?.weight} kg</span>
                                  </div>
                                  <div>
                                    <span className="detail-label">BMI:</span>
                                    <span>{desc.vitalSigns?.bmi}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="expanded-section">
                                <h4>Prescribed Medicines</h4>
                                {desc.medicines?.length > 0 ? (
                                  <table className="nested-table">
                                    <thead>
                                      <tr>
                                        <th>Medicine</th>
                                        <th>Dosage</th>
                                        <th>Frequency</th>
                                        <th>Duration</th>
                                        <th>Instructions</th>
                                        <th>Type</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {desc.medicines.map((medicine, idx) => (
                                        <tr key={idx}>
                                          <td>{medicine.name}</td>
                                          <td>{medicine.dosage}</td>
                                          <td>{medicine.frequency}</td>
                                          <td>{medicine.duration}</td>
                                          <td>{medicine.instructions || 'N/A'}</td>
                                          <td>{medicine.type}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                ) : (
                                  <p>No medicines prescribed</p>
                                )}
                              </div>

                              <div className="expanded-section">
                                <h4>Prescribed Tests</h4>
                                {desc.testsPrescribed?.length > 0 ? (
                                  <table className="nested-table">
                                    <thead>
                                      <tr>
                                        <th>Test Name</th>
                                        <th>Instructions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {desc.testsPrescribed.map((test, idx) => (
                                        <tr key={idx}>
                                          <td>{test.name}</td>
                                          <td>{test.instructions}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                ) : (
                                  <p>No tests prescribed</p>
                                )}
                              </div>

                              <div className="expanded-section">
                                <h4>Fee Details</h4>
                                <div className="details-grid">
                                  <div>
                                    <span className="detail-label">Consultation Fee:</span>
                                    <span>₹{desc.fee?.consultationFee}</span>
                                  </div>
                                  <div>
                                    <span className="detail-label">Medication Fee:</span>
                                    <span>₹{desc.fee?.medicationFee}</span>
                                  </div>
                                  <div>
                                    <span className="detail-label">Total Fee:</span>
                                    <span>₹{desc.fee?.totalFee}</span>
                                  </div>
                                  <div>
                                    <span className="detail-label">Payment Status:</span>
                                    <span className={`status-badge ${desc.paymentStatus === 'Paid' ? 'paid' : 'unpaid'}`}>
                                      {desc.paymentStatus}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="expanded-section">
                                <h4>Other Details</h4>
                                <div className="details-grid">
                                  {/* <div>
                                    <span className="detail-label">Appointment ID:</span>
                                    {<span>{desc.appointmentId}</span>}
                                  </div> */}
                                  <div>
                                    <span className="detail-label">Emergency:</span>
                                    <span>{desc.isEmergency ? 'Yes' : 'No'}</span>
                                  </div>
                                  <div>
                                    <span className="detail-label">Created At:</span>
                                    <span>{new Date(desc.createdAt).toLocaleString()}</span>
                                  </div>
                                  <div>
                                    <span className="detail-label">Updated At:</span>
                                    <span>{new Date(desc.updatedAt).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-data">
                      <div className="empty-state">
                        <Lottie 
                          animationData={animationData} 
                          style={{ height: 200, width: 200, overflow: 'hidden' }} 
                        />
                        <p>No descriptions found</p>
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
        .view-button {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          padding: 0.4rem 0.8rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: background-color 0.3s;
        }

        .view-button:hover {
          background-color: #2563eb;
        }

        .view-button:active {
          background-color: #1d4ed8;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .download-pdf-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: #4CAF50;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background-color 0.3s;
        }

        .download-pdf-btn:hover {
          background-color: #45a049;
        }

        .download-pdf-btn:active {
          background-color: #3e8e41;
        }

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
        .fees .stat-icon { background-color: rgba(111, 66, 193, 0.2); color: #6f42c1; }
        .paid .stat-icon { background-color: rgba(40, 167, 69, 0.2); color: #28a745; }
        .unpaid .stat-icon { background-color: rgba(220, 53, 69, 0.2); color: #dc3545; }
        .consultation .stat-icon { background-color: rgba(255, 193, 7, 0.2); color: #ffc107; }
        .medication .stat-icon { background-color: rgba(23, 162, 184, 0.2); color: #17a2b8; }
        
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
        
        /* Descriptions Table */
        .descriptions-table {
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
        
        .clickable-row {
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .clickable-row:hover {
          background-color: #1e3050;
        }
        
        .expanded-row {
          background-color: #0f172a;
        }
        
        .expanded-content {
          padding: 1rem;
        }
        
        .expanded-section {
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #2d3748;
          overflow: hidden;
        }
        
        .expanded-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        
        .expanded-section h4 {
          color: #e9ecef;
          margin-bottom: 1rem;
        }
        
        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }
        
        .detail-label {
          display: inline-block;
          color: #adb5bd;
          min-width: 150px;
          margin-right: 0.5rem;
          overflow: hidden;
        }
        
        .nested-table {
          width: 100%;
          margin-top: 0.5rem;
          border-collapse: collapse;
          font-size: 0.85rem;
        }
        
        .nested-table th {
          background-color: #1e3050;
          padding: 0.5rem;
        }
        
        .nested-table td {
          padding: 0.5rem;
          border: 1px solid #2d3748;
        }
        
        .patient-name {
          font-weight: 500;
          color: white;
        }
        
        .fees-amount {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        
        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          overflow: hidden;
        }
        
        .status-badge.paid {
          background-color: rgba(40, 167, 69, 0.2);
          color: #28a745;
            overflow: hidden;
        }
        
        .status-badge.unpaid {
          background-color: rgba(220, 53, 69, 0.2);
          color: #dc3545;
            overflow: hidden;
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
            margin-left: 0; /* Remove left margin on smaller screens */
          }
        }
      `}</style>
    </div>
  );
};

export default DescriptionsDashboard;