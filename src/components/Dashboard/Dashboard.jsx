import { API_BASE_URL } from "../../api";
import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../main";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FiBell, FiChevronDown } from "react-icons/fi";
import { Chart, registerables } from "chart.js";
import DashboardStats from "./DashboardStats";
import DashboardAdmins from "./DashboardAdmins";
import DashboardAppointments from "./DashboardAppointments";
import FloatingCalculatorButton from "../FloatingButton";

Chart.register(...registerables);

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [patientsCount, setPatientsCount] = useState(0);
  const [stats, setStats] = useState({
    pending: 0,
    accepted: 0,
    rejected: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [statusFilter, setStatusFilter] = useState("All");

  const navigate = useNavigate();
  const { isAuthenticated, admin } = useContext(Context);

  // Fetch admins on component mount
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE_URL}/api/v1/user/admins`,
          { withCredentials: true }
        );
        setAdmins(data.admins);
        setAdminsLoading(false);
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching admins");
        setAdminsLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  // Check if the user is on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle search input change
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentsRes, doctorsRes, patientsRes] = await Promise.all([
          axios.get(
            `${API_BASE_URL}/api/v1/appointment/getall`,
            { withCredentials: true }
          ),
          axios.get(
            `${API_BASE_URL}/api/v1/user/doctors`,
            { withCredentials: true }
          ),
          axios.get(
            `${API_BASE_URL}/api/v1/user/getAllPatiens`,
            { withCredentials: true }
          ),
        ]);

        // Process appointments
        setAppointments(appointmentsRes.data.appointments);
        setAppointmentsCount(appointmentsRes.data.appointments.length);

        const statusCounts = appointmentsRes.data.appointments.reduce(
          (acc, curr) => {
            acc[curr.status.toLowerCase()] =
              (acc[curr.status.toLowerCase()] || 0) + 1;
            return acc;
          },
          {}
        );

        setStats({
          pending: statusCounts.pending || 0,
          accepted: statusCounts.accepted || 0,
          rejected: statusCounts.rejected || 0,
          Completed: statusCounts.Completed || 0,
        });

        // Process doctors and patients
        setDoctorsCount(doctorsRes.data.doctors.length);
        setPatientsCount(patientsRes.data.patients.length);

        // Wait for at least 1 second before hiding loader
        setTimeout(() => setLoading(false), 1000);
      } catch (error) {
        console.error("Error fetching data", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle appointment status update
  const handleUpdateStatus = async (appointmentId, status, fees) => {
    try {
      const { data } = await axios.put(
  `${API_BASE_URL}/api/v1/appointment/update/${appointmentId}`,
        { status, fees },
        { withCredentials: true }
      );
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, status, fees }
            : appointment
        )
      );

      setStats((prev) => {
        const newStats = { ...prev };
        const oldStatus = appointments
          .find((a) => a._id === appointmentId)
          ?.status.toLowerCase();
        if (oldStatus) {
          newStats[oldStatus] -= 1;
        }
        newStats[status.toLowerCase()] =
          (newStats[status.toLowerCase()] || 0) + 1;
        return newStats;
      });

      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating status");
    }
  };

  // Handle delete appointment
  const handleDeleteAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.delete(
  `${API_BASE_URL}/api/v1/appointment/delete/${appointmentId}`,
        { withCredentials: true }
      );
      setAppointments((prev) =>
        prev.filter((app) => app._id !== appointmentId)
      );
      setAppointmentsCount((prev) => prev - 1);
      toast.success(data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error deleting appointment"
      );
    }
  };

  const exportToExcel = () => {
    const dataToExport = appointments.map((appointment, index) => ({
      "S.No": index + 1,
      "Patient Name": `${appointment.firstName} ${appointment.lastName}`,
      Phone: appointment.phone,
      Date: new Date(appointment.appointment_date).toLocaleDateString(),
      Doctor: `${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
      Department: appointment.department,
      Status: appointment.status,
      Fees: appointment.fees || 0,
      Visited: appointment.hasVisited ? "Yes" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Appointments");
    XLSX.writeFile(workbook, "Appointments_List.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(44, 123, 229);
    doc.text("Appointments Report", 105, 15, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 22, {
      align: "center",
    });

    const tableData = appointments.map((appointment, index) => [
      index + 1,
      `${appointment.firstName} ${appointment.lastName}`,
      appointment.phone,
      new Date(appointment.appointment_date).toLocaleDateString(),
      `${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
      appointment.department,
      appointment.status,
      appointment.fees || 0,
      appointment.hasVisited ? "Yes" : "No",
    ]);

    autoTable(doc, {
      head: [
        [
          "S.No",
          "Patient",
          "Phone",
          "Date",
          "Doctor",
          "Department",
          "Status",
          "Fees",
          "Visited",
        ],
      ],
      body: tableData,
      startY: 30,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        halign: "center",
        textColor: [50, 50, 50],
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
    });

    doc.save("Appointments_Report.pdf");
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      `${appointment.firstName} ${appointment.lastName} ${appointment.phone} ${appointment.doctor.firstName} ${appointment.doctor.lastName} ${appointment.department}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesDate = dateFilter
      ? new Date(appointment.appointment_date).toLocaleDateString() ===
        new Date(dateFilter).toLocaleDateString()
      : true;

    const matchesStatus = statusFilter === "All" 
      ? true 
      : appointment.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesDate && matchesStatus;
  });

  // Pagination logic
  const indexOfLastAppointment = currentPage * itemsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - itemsPerPage;
  const currentAppointments = filteredAppointments.slice(
    indexOfFirstAppointment,
    indexOfLastAppointment
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  // Chart data
  const appointmentStatusData = {
    labels: ["Pending", "Accepted", "Rejected", "Completed"],
    datasets: [
      {
        label: "Appointments by Status",
        data: [stats.pending, stats.accepted, stats.rejected],
        backgroundColor: [
          "rgba(255, 193, 7, 0.8)",
          "rgba(40, 167, 69, 0.8)",
          "rgba(220, 53, 69, 0.8)",
        ],
        borderColor: [
          "rgba(255, 193, 7, 1)",
          "rgba(40, 167, 69, 1)",
          "rgba(220, 53, 69, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const monthlyAppointmentsData = {
    labels: [
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
    ],
    datasets: [
      {
        label: "Appointments per Month",
        data: [15, 22, 18, 25, 30, 28, 35, 32, 30, 28, 25, 20],
        backgroundColor: "rgba(13, 110, 253, 0.5)",
        borderColor: "rgba(13, 110, 253, 1)",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const miniLineGraphData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Weekly Stats",
        data: [25, 40, 30, 45],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
        fill: true,
        borderWidth: 2,
      },
    ],
  };

  const doctorsSpecializationData = {
    labels: [
      "Cardiology",
      "Neurology",
      "Pediatrics",
      "Orthopedics",
      "Dermatology",
      "Oncology",
    ],
    datasets: [
      {
        label: "Doctors by Specialization",
        data: [5, 3, 7, 4, 6, 2],
        backgroundColor: [
          "rgba(220, 53, 69, 0.7)",
          "rgba(13, 110, 253, 0.7)",
          "rgba(255, 193, 7, 0.7)",
          "rgba(25, 135, 84, 0.7)",
          "rgba(111, 66, 193, 0.7)",
          "rgba(214, 51, 132, 0.7)",
        ],
        borderWidth: 1,
        borderRadius: 30,
      },
    ],
  };

  const weeklyVisitsData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Weekly Patient Visits",
        data: [45, 60, 75, 50, 80, 40, 30],
        backgroundColor: "rgba(214, 51, 132, 0.7)",
        borderColor: "rgba(214, 51, 132, 1)",
        borderWidth: 2,
        borderRadius: 40,
      },
    ],
  };

  const revenueByDepartmentData = {
    labels: [
      "Cardiology",
      "Neurology",
      "Pediatrics",
      "Orthopedics",
      "Dermatology",
    ],
    datasets: [
      {
        label: "Revenue by Department (in ₹)",
        data: [125000, 98000, 75000, 110000, 85000],
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const patientAgeDistributionData = {
    labels: ["0-18", "19-30", "31-45", "46-60", "60+"],
    datasets: [
      {
        label: "Patient Age Distribution",
        data: [15, 35, 25, 15, 10],
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
        ],
        borderWidth: 1,
      },
    ],
  };

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  if (loading) {
    return (
      
      <div className="dashboard-container">
        {/* Skeleton Loader */}
        <div className="skeleton-loader">
          {/* Top Header Skeleton */}
          <div className="skeleton-header">
            <div
              className="skeleton-text"
              style={{ width: "200px", height: "24px" }}
            ></div>
            <div className="skeleton-actions">
              <div className="skeleton-icon"></div>
              <div className="skeleton-avatar"></div>
            </div>
          </div>

          {/* Welcome Section Skeleton */}
          <div className="skeleton-welcome">
            <div
              className="skeleton-text"
              style={{ width: "150px", height: "28px" }}
            ></div>
            <div
              className="skeleton-text"
              style={{ width: "250px", height: "18px", marginTop: "8px" }}
            ></div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="skeleton-stats-grid">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="skeleton-stat-card">
                <div className="skeleton-stat-content">
                  <div className="skeleton-stat-icon"></div>
                  <div className="skeleton-stat-info">
                    <div
                      className="skeleton-text"
                      style={{ width: "40px", height: "24px" }}
                    ></div>
                    <div
                      className="skeleton-text"
                      style={{
                        width: "100px",
                        height: "16px",
                        marginTop: "8px",
                      }}
                    ></div>
                  </div>
                </div>
                <div className="skeleton-mini-graph"></div>
              </div>
            ))}
          </div>

          {/* Charts Grid Skeleton */}
          <div className="skeleton-charts-grid">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="skeleton-chart-card">
                <div className="skeleton-chart-title"></div>
                <div className="skeleton-chart"></div>
              </div>
            ))}
          </div>

          {/* Table Skeleton */}
          <div className="skeleton-table">
            <div className="skeleton-table-header">
              <div
                className="skeleton-text"
                style={{ width: "120px", height: "20px" }}
              ></div>
              <div className="skeleton-export-buttons">
                <div className="skeleton-button"></div>
                <div className="skeleton-button"></div>
              </div>
            </div>
            <div className="skeleton-table-content">
              <div className="skeleton-table-row"></div>
              <div className="skeleton-table-row"></div>
              <div className="skeleton-table-row"></div>
            </div>
          </div>
        </div>
         
        <style jsx="true">{`
          .skeleton-loader {
            padding: 1.5rem;
            margin-left: 270px;
            background-color: rgba(32, 32, 52, 0.92);
            min-height: 100vh;
          }

          .skeleton-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solidrgba(48, 59, 77, 0.9);
          }

          .skeleton-actions {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .skeleton-icon {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: linear-gradient(
              90deg,
              #2d3748 25%,
              #1a202c 50%,
              #2d3748 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }

          .skeleton-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: linear-gradient(
              90deg,
              #2d3748 25%,
              #1a202c 50%,
              #2d3748 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }

          .skeleton-text {
            background: linear-gradient(
              90deg,
              #2d3748 25%,
              #1a202c 50%,
              #2d3748 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
          }

          .skeleton-stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
          }

          .skeleton-stat-card {
            background-color: rgb(21, 32, 65);
            border-radius: 10px;
            padding: 1rem;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
          }

          .skeleton-stat-content {
            display: flex;
            align-items: center;
            margin-bottom: 0.5rem;
          }

          .skeleton-stat-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 1rem;
            background: linear-gradient(
              90deg,
              #2d3748 25%,
              #1a202c 50%,
              #2d3748 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }

          .skeleton-stat-info {
            flex: 1;
          }

          .skeleton-mini-graph {
            height: 50px;
            width: 100%;
            margin-top: 0.5rem;
            border-radius: 4px;
            background: linear-gradient(
              90deg,
              #2d3748 25%,
              #1a202c 50%,
              #2d3748 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }

          .skeleton-charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
          }

          .skeleton-chart-card {
            background-color: #16213e;
            border-radius: 10px;
            padding: 1rem;
          }

          .skeleton-chart-title {
            width: 120px;
            height: 20px;
            margin-bottom: 1rem;
            background: linear-gradient(
              90deg,
              #2d3748 25%,
              #1a202c 50%,
              #2d3748 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
          }

          .skeleton-chart {
            height: 220px;
            border-radius: 4px;
            background: linear-gradient(
              90deg,
              #2d3748 25%,
              #1a202c 50%,
              #2d3748 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }

          .skeleton-table {
            background-color: #16213e;
            border-radius: 10px;
            padding: 1rem;
            margin-top: 1.5rem;
          }

          .skeleton-table-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }

          .skeleton-export-buttons {
            display: flex;
            gap: 0.5rem;
          }

          .skeleton-button {
            width: 80px;
            height: 32px;
            border-radius: 6px;
            background: linear-gradient(
              90deg,
              #2d3748 25%,
              #1a202c 50%,
              #2d3748 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }

          .skeleton-table-content {
            margin-top: 1rem;
          }

          .skeleton-table-row {
            height: 50px;
            background: linear-gradient(
              90deg,
              #2d3748 25%,
              #1a202c 50%,
              #2d3748 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
            margin-bottom: 0.5rem;
          }

          @keyframes shimmer {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }

          @media (max-width: 768px) {
            .skeleton-loader {
              margin-left: 0;
              padding: 1rem;
            }

            .skeleton-stats-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .skeleton-charts-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 576px) {
            .skeleton-stats-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
       <>
         <FloatingCalculatorButton/>
        </>
      {/* Top Header with Search, Notifications and Profile */}
      <div className="dashboard-top-header">
        <div className="header-title">
          <h1>Dashboard</h1>
          <p>Welcome back, <span className="admin-name">{admin?.firstName} {admin?.lastName}</span></p>
        </div>
        <div className="header-actions">
          <button className="notification-btn">
            <div className="notification-icon">
              <FiBell />
            </div>
          </button>
          <div 
            className="profile-btn" 
            onClick={() => navigate("/admin/profile")}
          >
            <div className="avatar">
              {admin?.firstName?.charAt(0).toUpperCase()}
              {admin?.lastName?.charAt(0).toUpperCase()}
            </div>
            {!isMobile && (
              <div className="profile-info">
                <span className="profile-name">{admin?.firstName}</span>
                <span className="profile-role">Administrator</span>
              </div>
            )}
            {!isMobile && <FiChevronDown className="dropdown-icon" />}
          </div>
        </div>
      </div>

      <div className="dashboard-header">
        <div className="welcome-section">
          <h2>Dashboard Overview</h2>
          <p>Welcome back, {admin && `${admin.firstName} ${admin.lastName}`}</p>
        </div>
      </div>

      <DashboardStats 
        isMobile={isMobile}
        stats={stats}
        appointmentsCount={appointmentsCount}
        doctorsCount={doctorsCount}
        patientsCount={patientsCount}
        miniLineGraphData={miniLineGraphData}
        appointmentStatusData={appointmentStatusData}
        monthlyAppointmentsData={monthlyAppointmentsData}
        doctorsSpecializationData={doctorsSpecializationData}
        weeklyVisitsData={weeklyVisitsData}
        revenueByDepartmentData={revenueByDepartmentData}
        patientAgeDistributionData={patientAgeDistributionData}
      />

      <DashboardAdmins 
        admins={admins} 
        adminsLoading={adminsLoading} 
        admin={admin} 
      />
   
      <DashboardAppointments
        isMobile={isMobile}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        currentAppointments={currentAppointments}
        filteredAppointments={filteredAppointments}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        totalPages={totalPages}
        paginate={paginate}
        exportToExcel={exportToExcel}
        exportToPDF={exportToPDF}
        handleUpdateStatus={handleUpdateStatus}
        handleDeleteAppointment={handleDeleteAppointment}
      />
      
      <style jsx="true">{`
        .dashboard-container {
          background-color: #1a1a2e;
          color: #e9ecef;
          min-height: 100vh;
          padding: 1.5rem;
          margin-left: 270px;
        }

        /* Top Header Styles */
        .dashboard-top-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(48, 59, 77, 0.9);
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-title {
          display: flex;
          flex-direction: column;
        }

        .header-title h1 {
          font-size: 1.5rem;
          margin: 0;
          color: #ffffff;
          font-weight: 600;
        }

        .header-title p {
          margin: 0.25rem 0 0;
          color: #a0aec0;
          font-size: 0.9rem;
        }

        .admin-name {
          color: #4ade80;
          font-weight: 500;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .notification-btn {
          position: relative;
          background: none;
          border: none;
          color: #cbd5e0;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notification-btn:hover {
          background-color: rgba(83, 194, 102, 0.3);
        }

        .notification-icon {
          position: relative;
          font-size: 1.35rem;
        }

        .profile-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0.25rem 0.5rem;
          border-radius: 8px;
        }

        .profile-btn:hover {
          background-color: rgba(74, 85, 104, 0.3);
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1rem;
        }

        .profile-info {
          display: flex;
          flex-direction: column;
        }

        .profile-name {
          font-size: 0.9rem;
          color: #e9ecef;
          font-weight: 500;
        }

        .profile-role {
          font-size: 0.75rem;
          color: #a0aec0;
        }

        .dropdown-icon {
          color: #a0aec0;
          font-size: 1rem;
          transition: transform 0.3s ease;
        }

        .profile-btn:hover .dropdown-icon {
          transform: translateY(2px);
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .dashboard-top-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .header-actions {
            width: 100%;
            justify-content: space-between;
          }
          
          .profile-btn {
            padding: 0.25rem;
          }
        }

        @media (max-width: 480px) {
          .header-title h1 {
            font-size: 1.3rem;
            text-align: center;
            justify-content: center;
          }
          .header-title p {
            text-align: center;
            justify-content: center;
            color: #a0aec0;
            font-size: 0.9rem;
          }
          
          .avatar {
            width: 36px;
            height: 36px;
            font-size: 0.9rem;
          }
          .profile-btn {
            padding: 0.25rem;
            margin-top: -0.5rem;
          }
        }

        /* Rest of the styles */
        .dashboard-header {
          margin-bottom: 1.5rem;
        }

        .welcome-section h2 {
          font-size: 1.5rem;
          margin: 0;
          color: #ffffff;
        }

        .welcome-section p {
          margin: 0.5rem 0 0;
          color: #adb5bd;
          font-size: 0.9rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .stat-card {
          background-color: #16213e;
          border-radius: 10px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .stat-content {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
          font-size: 1.2rem;
        }

        .total-appointments .stat-icon {
          background-color: rgba(13, 110, 253, 0.2);
          color: #0d6efd;
        }

        .doctors .stat-icon {
          background-color: rgba(214, 51, 132, 0.2);
          color: #d63384;
        }

        .patients .stat-icon {
          background-color: rgba(25, 135, 84, 0.2);
          color: #198754;
        }

        .pending .stat-icon {
          background-color: rgba(255, 193, 7, 0.2);
          color: #ffc107;
        }

        .stat-info h3 {
          font-size: 1.5rem;
          margin: 0;
          color: white;
        }

        .stat-info p {
          margin: 0.2rem 0 0;
          color: #adb5bd;
          font-size: 0.8rem;
        }

        .mini-graph {
          height: 50px;
          width: 100%;
          margin-top: 0.5rem;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .chart-card {
          background-color: #16213e;
          border-radius: 10px;
          padding: 1rem;
          transition: transform 0.3s ease;
        }

        .chart-card:hover {
          transform: translateY(-5px);
        }

        .chart-card h4 {
          margin-top: 0;
          margin-bottom: 1rem;
          color: white;
          font-size: 1rem;
        }

        .chart-container {
          height: 220px;
          position: relative;
        }

        .appointments-table {
          background-color: #16213e;
          border-radius: 10px;
          padding: 1rem;
          margin-top: 1.5rem;
        }

        .admins-container {
          background-color: #16213e;
          border-radius: 10px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .admins-container h3 {
          margin-top: 0;
          margin-bottom: 1rem;
          color: white;
          font-size: 1.1rem;
        }

        .admins-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }

        .admin-card {
          background-color: #0f3460;
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          align-items: center;
          transition: transform 0.3s ease;
        }

        .admin-card:hover {
          transform: translateY(-3px);
        }

        .admin-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #0d6efd;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-right: 1rem;
          flex-shrink: 0;
        }

        .admin-info {
          flex: 1;
          min-width: 0;
        }

        .admin-info h4 {
          margin: 0 0 0.25rem 0;
          color: white;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .you-badge {
          background-color: rgba(25, 135, 84, 0.63);
          color:rgb(236, 248, 242);
          padding: 0.15rem 0.4rem;
          border-radius: 20px;
          font-size: 0.6rem;
          font-weight: 500;
        }

        .admin-detail {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.75rem;
          color: #adb5bd;
          margin-bottom: 0.2rem;
        }

        .admin-detail .icon {
          color: #4d7cfe;
          font-size: 0.8rem;
        }

        .admin-stats {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-left: 0.5rem;
          padding-left: 0.5rem;
          border-left: 1px solid rgb(200, 208, 220);
        }

        .stat-icon {
          color: #d63384;
          font-size: 1rem;
        }

        .stat-value {
          font-weight: bold;
          color: white;
          font-size: 0.9rem;
        }

        .stat-label {
          font-size: 0.7rem;
          color: #adb5bd;
        }

        /* Skeleton Loader Styles */
        .admins-skeleton {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .skeleton-admin-card {
          background-color: #0f3460;
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          align-items: center;
        }

        .skeleton-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          margin-right: 1rem;
          background: linear-gradient(90deg, #2d3748 25%, #1a202c 50%, #2d3748 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-info {
          flex: 1;
        }

        .skeleton-line {
          height: 12px;
          background: linear-gradient(90deg, #2d3748 25%, #1a202c 50%, #2d3748 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }

        .skeleton-line:first-child {
          width: 80%;
        }

        .skeleton-line:nth-child(2) {
          width: 60%;
        }

        .skeleton-line:last-child {
          width: 70%;
        }

        .skeleton-badge {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(90deg, #2d3748 25%, #1a202c 50%, #2d3748 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          margin-left: 0.5rem;
        }

        /* Admin Popup Styles */
        .admin-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .admin-popup {
          background-color: #16213e;
          border-radius: 12px;
          padding: 2rem;
          max-width: 500px;
          width: 100%;
          position: relative;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          animation: popIn 0.3s ease-out;
        }

        .close-popup {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          color: #adb5bd;
          font-size: 1.5rem;
          cursor: pointer;
          transition: color 0.2s;
        }

        .close-popup:hover {
          color: #e53e3e;
        }

        .popup-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .popup-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: bold;
          margin: 0 auto 1rem;
        }

        .popup-header h3 {
          margin: 0.5rem 0 0;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .popup-header p {
          margin: 0.25rem 0 0;
          color: #adb5bd;
          font-size: 0.9rem;
        }

        .popup-details {
          display: grid;
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .detail-item .icon {
          color: #4d7cfe;
          font-size: 1.1rem;
        }

        .detail-item span {
          color: #e9ecef;
          font-size: 0.95rem;
        }

        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Table Controls */
        .table-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .search-filter-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
          min-width: 0;
          flex-wrap: wrap;
        }

        .search-input {
          padding: 0.5rem 1rem;
          border-radius: 40px;
          border: 1px solid #3a4a6b;
          background-color: #0f3460;
          color: #ffffff;
          font-size: 0.85rem;
          flex: 1;
          min-width: 150px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .search-input:focus {
          outline: none;
          border-color: #4d7cfe;
          box-shadow: 0 0 0 2px rgba(77, 124, 254, 0.2);
        }

        .date-filter-wrapper {
          position: relative;
          display: flex;
          color: #ffffff;
          align-items: center;
          background-color: #0f3460;
          border-radius: 8px;
          border: 1px solid #3a4a6b;
          padding-right: 0.5rem;
          height: 30px;
          transition: all 0.3s ease;
        }

        .date-filter-wrapper:focus-within {
          border-color: #4d7cfe;
          box-shadow: 0 0 0 2px rgb(237, 238, 241);
        }

        .clear-date {
          background: none;
          border: none;
          color: #a0aec0;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          transition: color 0.2s ease;
        }

        .clear-date:hover {
          color: #e53e3e;
        }

        /* Status Filter Dropdown */
        .status-filter {
          padding: 0.5rem 1rem;
          border-radius: 50px;
          background-color: #0f3460;
          color: white;
          border: 1px solid #3a4a6b;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.85rem;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23adb5bd' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 12px;
          padding-right: 2rem;
          min-width: 150px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .status-filter:focus {
          outline: none;
          border-color: #4d7cfe;
          box-shadow: 0 0 0 2px rgba(77, 124, 254, 0.2);
        }

        .export-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .export-btn {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.5rem 0.8rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .export-btn.excel {
          background-color: #2a7f3f;
          color: white;
        }

        .export-btn.pdf {
          background-color: #d32f2f;
          color: white;
        }

        .export-btn:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }

        .table-container {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }

        th {
          background-color: #0f3460;
          color: white;
          padding: 0.75rem;
          text-align: left;
          font-weight: 500;
          font-size: 0.8rem;
        }

        td {
          padding: 0.75rem;
          border-bottom: 1px solid #2d3748;
          color: #e9ecef;
          font-size: 0.8rem;
        }

        .patient-info {
          display: flex;
          flex-direction: column;
        }

        .patient-info .name {
          font-weight: 500;
          color: white;
          font-size: 0.9rem;
        }

        .patient-info .phone {
          font-size: 0.7rem;
          color: #adb5bd;
          margin-top: 0.2rem;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .status-badge.pending {
          background-color: rgba(255, 193, 7, 0.2);
          color: #ffc107;
        }

        .status-badge.accepted {
          background-color: rgba(25, 135, 84, 0.2);
          color: #198754;
        }

        .status-badge.rejected {
          background-color: rgba(220, 53, 69, 0.2);
          color: #dc3545;
        }

        .fees-input {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .fees-icon {
          color: #adb5bd;
          font-size: 0.9rem;
        }

        .fees-input input {
          background-color: #0f3460;
          color: white;
          border: 1px solid #2d3748;
          border-radius: 4px;
          padding: 0.3rem 0.5rem;
          width: 70px;
          font-size: 0.8rem;
        }

        .fees-input input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .visited-yes {
          color: #198754;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .visited-no {
          color: #dc3545;
        }

        .action-buttons {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-select {
          background-color: #0f3460;
          color: white;
          border: 1px solid #2d3748;
          border-radius: 4px;
          padding: 0.3rem 0.5rem;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .status-select:hover {
          border-color: #3b82f6;
        }

        .status-select:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .delete-btn {
          background-color: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.4rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .delete-btn:hover {
          background-color: #c82333;
        }

        .no-data {
          text-align: center;
          padding: 1.5rem;
          color: #6c757d;
          font-size: 0.9rem;
        }

        /* Pagination Styles */
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }

        .pagination-btn {
          padding: 0.5rem 0.8rem;
          border: none;
          border-radius: 50px;
          background-color: #0f3460;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.85rem;
          min-width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .pagination-btn:hover:not(:disabled) {
          background-color: #1e4b8c;
          transform: translateY(-2px);
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
        }

        .pagination-btn.active {
          background-color: #4d7cfe;
          font-weight: bold;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        /* Responsive adjustments */
        @media (max-width: 1200px) {
          .dashboard-container {
            margin-left: 0;
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }

        @media (max-width: 992px) {
          .charts-grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1rem;
          }

          .dashboard-top-header {
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .chart-container {
            height: 200px;
          }

          .admins-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          }
          
          .admin-card {
            padding: 0.75rem;
          }
          
          .admin-avatar {
            width: 36px;
            height: 36px;
            font-size: 0.8rem;
          }
          
          .admin-info h4 {
            font-size: 0.8rem;
          }
          
          .admin-detail {
            font-size: 0.7rem;
          }

          .table-controls {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }
          
          .search-filter-container {
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .search-input,
          .date-filter-wrapper {
            width: 100%;
          }
          
          .date-filter {
            width: calc(100% - 2rem);
          }
        }

        @media (max-width: 576px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .charts-grid {
            grid-template-columns: 1fr;
          }

          .table-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .export-buttons {
            width: 100%;
          }

          .export-btn {
            flex: 1;
            justify-content: center;
          }

          .stat-info h3 {
            font-size: 1.3rem;
          }

          .chart-card h4 {
            font-size: 0.9rem;
          }

          .admins-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .export-buttons {
            width: 100%;
          }
          
          .export-btn {
            flex: 1;
            justify-content: center;
          }

          .pagination {
            gap: 0.2rem;
          }
          
          .pagination-btn {
            min-width: 32px;
            height: 32px;
            padding: 0.3rem;
          }
          
          .pagination-btn:first-child,
          .pagination-btn:last-child {
            display: none;
          }
          
          .pagination-btn:first-child::after,
          .pagination-btn:last-child::after {
            content: "◄";
            font-size: 0.8rem;
          }
          
          .pagination-btn:last-child::after {
            content: "►";
          }
        }

        @media (max-width: 400px) {
          .dashboard-container {
            padding: 0.75rem;
          }
         

          .stat-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .stat-icon {
            margin-right: 0;
            margin-bottom: 0.5rem;
          }

          .export-btn {
            padding: 0.4rem 0.6rem;
          }

          .chart-container {
            height: 180px;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;