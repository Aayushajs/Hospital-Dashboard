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

// Root-level error boundary for handling rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Dashboard Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: "20px", 
          background: "#1a1a2e", 
          color: "#e9ecef", 
          borderRadius: "10px",
          margin: "20px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
        }}>
          <h2>Something went wrong.</h2>
          <p style={{ color: "#ff6b6b" }}>
            {this.state.error && this.state.error.toString()}
          </p>
          <button
            style={{
              background: "#3b82f6",
              color: "white",
              border: "none",
              padding: "8px 15px",
              borderRadius: "5px",
              cursor: "pointer",
              marginTop: "15px"
            }}
            onClick={() => window.location.reload()}
          >
            Reload Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const DoctorDashboardContent = () => {
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
        const appointmentsData = appointmentsRes.data.appointments;
        setAppointments(appointmentsData);
        setAppointmentsCount(appointmentsRes.data.totalAppointments);

        const statusCounts = appointmentsData.reduce(
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
        
        // Process chart data immediately after fetching
        const processedData = processChartData(appointmentsData);
        setChartData(processedData);

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
      
      // Update appointments array with new status
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, status, fees }
            : appointment
        )
      );

      // Update stats counters
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
      
      // Get the appointment status before removing it from the array
      const appointmentToDelete = appointments.find(app => app._id === appointmentId);
      const statusToUpdate = appointmentToDelete?.status.toLowerCase();
      
      // Update appointments array
      setAppointments((prev) =>
        prev.filter((app) => app._id !== appointmentId)
      );
      
      // Update appointment count
      setAppointmentsCount((prev) => prev - 1);
      
      // Update stats counters if we found the appointment
      if (statusToUpdate) {
        setStats(prev => ({
          ...prev,
          [statusToUpdate]: Math.max(0, prev[statusToUpdate] - 1)
        }));
      }
      
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

  // Process appointment data for charts
  const processChartData = (appointmentsData) => {
    const currentDate = new Date();
  const now = currentDate.getTime();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  // Hour labels (24h)
  const hourLabels = Array.from({ length: 24 }, (_, h) => h.toString().padStart(2, '0'));
    
    // Status Data for Appointment Status Chart (Monthly breakdown)
    const statusData = monthNames.map(month => ({
      month,
      completed: 0,
      cancelled: 0
    }));
    
    // Monthly data initialization
    const monthlyData = Array(12).fill(0);
    const monthlyCompleted = Array(12).fill(0);
    const monthlyPending = Array(12).fill(0);
    const monthlyAccepted = Array(12).fill(0);
    const monthlyRejected = Array(12).fill(0);
    
    // Year data by months (for yearly view)
    const yearlyPending = Array(12).fill(0);
    const yearlyAccepted = Array(12).fill(0);
    const yearlyCompleted = Array(12).fill(0);
    const yearlyRejected = Array(12).fill(0);

  // Daily (last 24 hours) data initialization (index: hour 0-23 of current day)
  const dailyPending = Array(24).fill(0);
  const dailyAccepted = Array(24).fill(0);
  const dailyCompleted = Array(24).fill(0);
  const dailyRejected = Array(24).fill(0);
    
    // Weekly data initialization (for weekly view)
    const weeklyAppointments = Array(7).fill(0);
    const weeklyPending = Array(7).fill(0);
    const weeklyAccepted = Array(7).fill(0);
    const weeklyCompleted = Array(7).fill(0);
    const weeklyRejected = Array(7).fill(0);
    const weeklyPatients = Array(7).fill(0);
    
    // Month data initialization (for monthly view - days of the month)
    const daysInCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const daysLabels = Array.from({ length: daysInCurrentMonth }, (_, i) => (i + 1).toString());
    const monthlyViewData = Array(daysInCurrentMonth).fill(0);
    const monthlyViewPending = Array(daysInCurrentMonth).fill(0);
    const monthlyViewAccepted = Array(daysInCurrentMonth).fill(0);
    const monthlyViewCompleted = Array(daysInCurrentMonth).fill(0);
    const monthlyViewRejected = Array(daysInCurrentMonth).fill(0);
    
    // Get the start of the current week (Sunday)
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    // Get the start of the current month
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    // Process each appointment for various time frames
    appointmentsData.forEach(appointment => {
      const date = new Date(appointment.appointment_date);
      const month = date.getMonth(); // 0-11
      const dayOfWeek = date.getDay(); // 0-6 (Sunday-Saturday)
      const dayOfMonth = date.getDate() - 1; // 0-30
      const status = appointment.status.toLowerCase();
  const hour = date.getHours();
      
      // Process for status chart (monthly)
      if (status === 'completed') {
        statusData[month].completed++;
      } else if (status === 'rejected') {
        statusData[month].cancelled++;
      }
      
      // Process for monthly appointments totals
      monthlyData[month]++;
      
      // Track appointments by status per month (yearly view)
      if (status === 'completed') {
        monthlyCompleted[month]++;
        yearlyCompleted[month]++;
      } else if (status === 'pending') {
        monthlyPending[month]++;
        yearlyPending[month]++;
      } else if (status === 'accepted') {
        monthlyAccepted[month]++;
        yearlyAccepted[month]++;
      } else if (status === 'rejected') {
        monthlyRejected[month]++;
        yearlyRejected[month]++;
      }
      
      // Process for weekly view (if appointment is in current week)
      if (date >= weekStart && date <= currentDate) {
        weeklyAppointments[dayOfWeek]++;
        
        if (status === 'pending') {
          weeklyPending[dayOfWeek]++;
        } else if (status === 'accepted') {
          weeklyAccepted[dayOfWeek]++;
        } else if (status === 'completed') {
          weeklyCompleted[dayOfWeek]++;
        } else if (status === 'rejected') {
          weeklyRejected[dayOfWeek]++;
        }
        
        // Count patients for weekly view
        weeklyPatients[dayOfWeek]++;
      }
      
      // Process for monthly view (if appointment is in current month)
      if (date >= monthStart && date <= currentDate && dayOfMonth < daysInCurrentMonth) {
        monthlyViewData[dayOfMonth]++;
        
        if (status === 'pending') {
          monthlyViewPending[dayOfMonth]++;
        } else if (status === 'accepted') {
          monthlyViewAccepted[dayOfMonth]++;
        } else if (status === 'completed') {
          monthlyViewCompleted[dayOfMonth]++;
        } else if (status === 'rejected') {
          monthlyViewRejected[dayOfMonth]++;
        }
      }

      // Process for daily (last 24h) view - include appointments within last 24 hours relative to now
      const diffHours = (now - date.getTime()) / (1000 * 60 * 60);
      if (diffHours >= 0 && diffHours < 24) {
        if (status === 'pending') {
          dailyPending[hour]++;
        } else if (status === 'accepted') {
          dailyAccepted[hour]++;
        } else if (status === 'completed') {
          dailyCompleted[hour]++;
        } else if (status === 'rejected') {
          dailyRejected[hour]++;
        }
      }
    });
    
    // Create formatted monthly appointments data
    const monthlyAppointments = monthNames.map((month, index) => ({
      month,
      appointments: monthlyData[index],
      completed: monthlyCompleted[index],
      pending: monthlyPending[index],
      accepted: monthlyAccepted[index],
      rejected: monthlyRejected[index]
    }));
    
 
    const analyticsData = dayLabels.map((day, index) => ({
      name: day,
      sales: weeklyAppointments[index], 
      subs: Math.round(weeklyCompleted[index]) 
    }));
    // Format data for weekly view (mini charts and main chart)
    const weeklyLineGraphData = {
      labels: dayLabels,
      datasetsArr: [
        {
          label: "Pending",
          data: weeklyPending,
          borderColor: "#ffc107",
          backgroundColor: "rgba(255,193,7,0.2)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Accepted",
          data: weeklyAccepted,
          borderColor: "#28a745",
          backgroundColor: "rgba(40,167,69,0.2)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Completed",
          data: weeklyCompleted,
          borderColor: "#0d6efd", 
          backgroundColor: "rgba(13,110,253,0.2)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Rejected",
          data: weeklyRejected,
          borderColor: "#dc3545",
          backgroundColor: "rgba(220,53,69,0.2)",
          fill: true,
          tension: 0.4,
        },
      ],
  analyticsData: analyticsData,
  weeklyAppointments: weeklyAppointments,
  weeklyPatients: weeklyPatients
    };
    
    // Format data for monthly view (days of current month)
    const monthlyLineGraphData = {
      labels: daysLabels,
      datasetsArr: [
        {
          label: "Pending",
          data: monthlyViewPending,
          borderColor: "#ffc107",
          backgroundColor: "rgba(255,193,7,0.2)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Accepted", 
          data: monthlyViewAccepted,
          borderColor: "#28a745",
          backgroundColor: "rgba(40,167,69,0.2)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Completed",
          data: monthlyViewCompleted,
          borderColor: "#0d6efd",
          backgroundColor: "rgba(13,110,253,0.2)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Rejected",
          data: monthlyViewRejected,
          borderColor: "#dc3545",
          backgroundColor: "rgba(220,53,69,0.2)",
          fill: true,
          tension: 0.4,
        },
      ],
      analyticsData: null
    };
    
    // Format data for yearly view (months of the year)
    const yearlyLineGraphData = {
      labels: monthNames,
      datasetsArr: [
        {
          label: "Pending",
          data: yearlyPending,
          borderColor: "#ffc107",
          backgroundColor: "rgba(255,193,7,0.2)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Accepted",
          data: yearlyAccepted,
          borderColor: "#28a745",
          backgroundColor: "rgba(40,167,69,0.2)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Completed",
          data: yearlyCompleted,
          borderColor: "#0d6efd",
          backgroundColor: "rgba(13,110,253,0.2)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Rejected",
          data: yearlyRejected,
          borderColor: "#dc3545",
          backgroundColor: "rgba(220,53,69,0.2)",
          fill: true,
          tension: 0.4,
        },
      ],
      analyticsData: null
    };

    // Format data for daily 24h view
    const dailyLineGraphData = {
      labels: hourLabels,
      datasetsArr: [
        {
          label: 'Pending',
          data: dailyPending,
          borderColor: '#ffc107',
          backgroundColor: 'rgba(255,193,7,0.2)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Accepted',
          data: dailyAccepted,
          borderColor: '#28a745',
          backgroundColor: 'rgba(40,167,69,0.2)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Completed',
          data: dailyCompleted,
          borderColor: '#0d6efd',
          backgroundColor: 'rgba(13,110,253,0.2)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Rejected',
          data: dailyRejected,
          borderColor: '#dc3545',
          backgroundColor: 'rgba(220,53,69,0.2)',
          fill: true,
          tension: 0.4
        }
      ],
      analyticsData: null
    };
    
    // Return all processed data
    return {
      statusData,
      monthlyAppointments,
      weeklyLineGraphData,   // Weekly view (days of the week)
      monthlyLineGraphData,  // Monthly view (days of the month)
  yearlyLineGraphData,   // Yearly view (months of the year)
  dailyLineGraphData     // Daily 24h view
    };
  };
  
  // Process chart data when appointments change
  const [chartData, setChartData] = useState({
    statusData: [],
    monthlyAppointments: [],
    weeklyLineGraphData: {},
    monthlyLineGraphData: {},
  yearlyLineGraphData: {},
  dailyLineGraphData: {}
  });

  // Update chart data when appointments change
  useEffect(() => {
    if (appointments.length > 0) {
      const processedData = processChartData(appointments);
      setChartData(processedData);
    }
  }, [appointments]);
  
  // Extract chart data from state
  const { statusData, monthlyAppointments, weeklyLineGraphData, monthlyLineGraphData, yearlyLineGraphData, dailyLineGraphData } = chartData;
  
  // Main status chart data structure for donut chart - updating with current stats
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
  
  // Monthly trend chart data
  const monthlyAppointmentsData = monthlyAppointments;

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
        weeklyLineGraphData={weeklyLineGraphData}
        monthlyLineGraphData={monthlyLineGraphData}
        yearlyLineGraphData={yearlyLineGraphData}
        dailyLineGraphData={dailyLineGraphData}
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



// Wrapper component with error boundary
const DoctorDashboard = () => {
  return (
    <ErrorBoundary>
      <DoctorDashboardContent />
    </ErrorBoundary>
  );
};

export default DoctorDashboard;