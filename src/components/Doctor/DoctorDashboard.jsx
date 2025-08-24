import { API_BASE_URL } from "../../api";
import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../main";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FiCheckCircle } from "react-icons/fi";
import DashboardHeader from "./DashboardHeader";
import DashboardSkeleton from "./DashboardSkeleton";
import { Chart, registerables } from "chart.js";
import DocterDashboardStats from "./DocterDashboardStats";
import DocterDashboardAppointments from "../Doctor/DashboardAppointments";
import FloatingCalculatorButton from "../FloatingButton";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

Chart.register(...registerables);

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [patientsCount, setPatientsCount] = useState(0);
  const [stats, setStats] = useState({
    pending: 0,
    accepted: 0,
    rejected: 0,
    completed: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [statusFilter, setStatusFilter] = useState("All");

  const navigate = useNavigate();
  
  const { isDoctorAuthenticated, doctor } = useContext(Context);

  // Check if the user is on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentsRes, patientsRes] = await Promise.all([
          axios.get(
            `${API_BASE_URL}/api/v1/appointment/getMyAppointments`,
            { withCredentials: true }
          ),
          axios.get(
            `${API_BASE_URL}/api/v1/user/getPatientsWithAppointments`,
            { withCredentials: true }
          ),
        ]);

        // Process appointments
        setAppointments(appointmentsRes.data.appointments);
        setAppointmentsCount(appointmentsRes.data.totalAppointments);

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
          completed: statusCounts.completed || 0,
        });

        // Process patients
        setPatientsCount(patientsRes.data.totalCount);

        // Wait for at least 1 second before hiding loader
        setTimeout(() => setLoading(false), 1000);
      } catch (error) {
        console.error("Error fetching data", error);
        toast.error("Failed to load dashboard data");
        setLoading(false);
      }
    };

    if (isDoctorAuthenticated) {
      fetchData();
    }
  }, [isDoctorAuthenticated]);

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
    try {
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
      toast.success("Exported to Excel successfully");
    } catch (error) {
      toast.error("Failed to export to Excel");
      console.error("Export error:", error);
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(18);
      doc.setTextColor(44, 123, 229);
      doc.text("Appointments Report", 105, 15, { align: "center" });

      // Add generation date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 22, {
        align: "center",
      });

      // Prepare table data
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

      // Add table
      doc.autoTable({
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

      // Save the PDF
      doc.save("Appointments_Report.pdf");
      toast.success("Exported to PDF successfully");
    } catch (error) {
      toast.error("Failed to export to PDF");
      console.error("PDF export error:", error);
    }
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
        data: [stats.pending, stats.accepted, stats.rejected, stats.completed],
        backgroundColor: [
          "rgba(255, 193, 7, 0.8)",
          "rgba(40, 167, 69, 0.8)",
          "rgba(220, 53, 69, 0.8)",
          "rgba(13, 110, 253, 0.8)",
        ],
        borderColor: [
          "rgba(255, 193, 7, 1)",
          "rgba(40, 167, 69, 1)",
          "rgba(220, 53, 69, 1)",
          "rgba(13, 110, 253, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const monthlyAppointmentsData = {
    labels: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
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

  if (!isDoctorAuthenticated) {
    return <Navigate to="/doctor/login" />;
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="dashboard-container">
      <FloatingCalculatorButton />
      
      {/* Top Header with Search, Notifications and Profile */}
      <DashboardHeader 
        user={doctor} 
        isMobile={isMobile} 
        navigate={navigate} 
      />
      
      {/* Stats and Charts Section */}
      <DocterDashboardStats 
        isMobile={isMobile}
        stats={stats}
        appointmentsCount={appointmentsCount}
        patientsCount={patientsCount}
        miniLineGraphData={miniLineGraphData}
        appointmentStatusData={appointmentStatusData}
        monthlyAppointmentsData={monthlyAppointmentsData}
      />

      {/* Appointments Table Section */}
      <DocterDashboardAppointments
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
          transition: all 0.3s ease;
        }
  .appointments-table {
    background-color: #16213e;
    border-radius: 10px;
    padding: 1rem;
    margin-top: 1.5rem;
    color: #e9ecef;
  }
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .table-header h3 {
    margin: 0;
    color: #fff;
    font-size: 1.1rem;
    font-weight: 600;
  }
  .table-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .search-filter-container {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  .search-input {
    padding: 0.5rem 1rem;
    border-radius: 40px;
    border: 1px solid #3a4a6b;
    background-color: #0f3460;
    color: #fff;
    font-size: 0.85rem;
    min-width: 150px;
    transition: all 0.3s ease;
  }
  .search-input:focus {
    outline: none;
    border-color: #4d7cfe;
    box-shadow: 0 0 0 2px rgba(77, 124, 254, 0.2);
  }
  .date-filter-wrapper {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: 1px solid #3a4a6b;
    background-color: #0f3460;
    color: #fff;
    font-size: 0.85rem;
    min-width: 150px;
    transition: all 0.3s ease;
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
  .status-filter {
    padding: 0.5rem 1rem;
    border-radius: 50px;
    background-color: #0f3460;
    color: #fff;
    border: 1px solid #3a4a6b;
    cursor: pointer;
    font-size: 0.85rem;
    min-width: 150px;
    transition: all 0.3s ease;
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
    color: #fff;
  }
  .export-btn.pdf {
    background-color: #d32f2f;
    color: #fff;
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
    color: #fff;
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
    color: #fff;
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
  .status-badge.completed {
    background-color: rgba(13, 110, 253, 0.2);
    color: #0d6efd;
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
    color: #fff;
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
    color: #fff;
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
    color: #fff;
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
    color: #fff;
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
  @media (max-width: 768px) {
    .appointments-table {
      padding: 1rem 0.5rem;
    }
    .table-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
    .table-controls {
      width: 100%;
      justify-content: space-between;
    }
    .search-filter-container {
      flex-direction: column;
      gap: 0.75rem;
    }
    .search-input,
    .date-filter-wrapper {
      width: 100%;
    }
    .status-filter {
      width: 100%;
    }
    .table-container {
      min-width: 0;
    }
    table {
      min-width: 600px;
    }
  }
  @media (max-width: 576px) {
    .appointments-table {
      padding: 0.5rem;
    }
    .table-header h3 {
      font-size: 1rem;
    }
    .search-input {
      font-size: 0.8rem;
    }
    .table-container {
      min-width: 0;
    }
    table {
      min-width: 400px;
    }
    .pagination-btn {
      min-width: 32px;
      height: 32px;
      padding: 0.3rem;
    }
  }
        @media (max-width: 1200px) {
          .dashboard-container {
            margin-left: 0;
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};



export default DoctorDashboard;