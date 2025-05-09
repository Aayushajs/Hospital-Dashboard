import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { GoCheckCircleFill } from "react-icons/go";
import { AiFillCloseCircle } from "react-icons/ai";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FiDownload, FiFileText } from "react-icons/fi";

Chart.register(...registerables);

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [stats, setStats] = useState({
    pending: 0,
    accepted: 0,
    rejected: 0
  });

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await axios.get(
         // "http://localhost:4000/api/v1/appointment/getall",
          "https://jainam-hospital-backend.onrender.com/api/v1/appointment/getall",
          { withCredentials: true }
        );
        setAppointments(data.appointments);
        setAppointmentsCount(data.appointments.length);
        
        const statusCounts = data.appointments.reduce((acc, curr) => {
          acc[curr.status.toLowerCase()] = (acc[curr.status.toLowerCase()] || 0) + 1;
          return acc;
        }, {});
        
        setStats({
          pending: statusCounts.pending || 0,
          accepted: statusCounts.accepted || 0,
          rejected: statusCounts.rejected || 0
        });
      } catch (error) {
        setAppointments([]);
      }
    };

    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get(
          //"http://localhost:4000/api/v1/user/doctors", 
          "https://jainam-hospital-backend.onrender.com/api/v1/user/doctors",
          { withCredentials: true }
        );
        setDoctorsCount(data.doctors.length);
      } catch (error) {
        console.error("Error fetching doctors", error);
      }
    };

    fetchAppointments();
    fetchDoctors();
  }, []);

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      const { data } = await axios.put(
       // `http://localhost:4000/api/v1/appointment/update/${appointmentId}`,
        `https://jainam-hospital-backend.onrender.com/api/v1/appointment/update/${appointmentId}`,
        { status },
        { withCredentials: true }
      );
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, status }
            : appointment
        )
      );
      
      setStats(prev => {
        const newStats = {...prev};
        const oldStatus = appointments.find(a => a._id === appointmentId)?.status.toLowerCase();
        if (oldStatus) newStats[oldStatus] -= 1;
        newStats[status.toLowerCase()] = (newStats[status.toLowerCase()] || 0) + 1;
        return newStats;
      });
      
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating status");
    }
  };

  // Excel Export Function
  const exportToExcel = () => {
    const dataToExport = appointments.map(appointment => ({
      "Patient Name": `${appointment.firstName} ${appointment.lastName}`,
      "Phone": appointment.phone,
      "Date": new Date(appointment.appointment_date).toLocaleDateString(),
      "Doctor": `${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
      "Department": appointment.department,
      "Status": appointment.status,
      "Visited": appointment.hasVisited ? "Yes" : "No"
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Appointments");
    XLSX.writeFile(workbook, "Appointments_List.xlsx");
  };

  // PDF Export Function
  const exportToPDF = () => {
    const doc = new jsPDF();
  
    doc.setFontSize(18);
    doc.text("Appointments Report", 105, 15, { align: 'center' });
  
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });
  
    const tableData = appointments.map(appointment => [
      `${appointment.firstName} ${appointment.lastName}`,
      appointment.phone,
      new Date(appointment.appointment_date).toLocaleDateString(),
      `${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
      appointment.department,
      appointment.status,
      appointment.hasVisited ? "Yes" : "No"
    ]);
  
    autoTable(doc, {
      head: [['Patient', 'Phone', 'Date', 'Doctor', 'Department', 'Status', 'Visited']],
      body: tableData,
      startY: 30,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        halign: 'center'
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      }
    });
  
    doc.save("Appointments_Report.pdf");
  };

  // Chart data configurations
  const appointmentStatusData = {
    labels: ["Pending", "Accepted", "Rejected"],
    datasets: [
      {
        label: "Appointments by Status",
        data: [stats.pending, stats.accepted, stats.rejected],
        backgroundColor: [
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(255, 99, 132, 0.7)"
        ],
        borderColor: [
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)"
        ],
        borderWidth: 1
      }
    ]
  };

  const monthlyAppointmentsData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Appointments per Month",
        data: [12, 19, 15, 25, 18, 22],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }
    ]
  };

  const doctorsSpecializationData = {
    labels: ["Cardiology", "Neurology", "Pediatrics", "Orthopedics", "Dermatology"],
    datasets: [
      {
        label: "Doctors by Specialization",
        data: [5, 3, 7, 4, 6],
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)"
        ],
        borderWidth: 1
      }
    ]
  };

  const { isAuthenticated, admin } = useContext(Context);
  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <>
      <section className="dashboard page">
        <div className="banner">
          <div className="welcome-card">
            <div className="profile">
              <img src="/doc.png" alt="docImg" />
              <div>
                <p>Welcome back,</p>
                <h3>{admin && `${admin.firstName} ${admin.lastName}`}</h3>
                <span>Administrator</span>
              </div>
            </div>
            <div className="stats">
              <div className="stat-card primary">
                <h3>{appointmentsCount}</h3>
                <p>Total Appointments</p>
                <div className="progress">
                  <div className="progress-bar" style={{ width: "75%" }}></div>
                </div>
              </div>
              <div className="stat-card success">
                <h3>{doctorsCount}</h3>
                <p>Registered Doctors</p>
                <div className="progress">
                  <div className="progress-bar" style={{ width: "60%" }}></div>
                </div>
              </div>
              <div className="stat-card warning">
                <h3>{stats.pending}</h3>
                <p>Pending Appointments</p>
                <div className="progress">
                  <div className="progress-bar" style={{ width: `${(stats.pending/appointmentsCount)*100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="graph-section">
          <div className="graph-card">
            <h4>Appointment Status</h4>
            <div className="chart-container">
              <Pie 
                data={appointmentStatusData} 
                options={{ 
                  responsive: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      align: 'center',
                      labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 20
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
          
          <div className="graph-card">
            <h4>Monthly Appointments</h4>
            <div className="chart-container">
              <Line 
                data={monthlyAppointmentsData} 
                options={{ 
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }} 
              />
            </div>
          </div>
          
          <div className="graph-card">
            <h4>Doctors by Specialization</h4>
            <div className="chart-container">
              <Bar 
                data={doctorsSpecializationData} 
                options={{ 
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>

        <div className="appointments-section">
          <div className="section-header">
            <h3>Recent Appointments</h3>
            <div className="export-buttons">
              <button className="export-btn" onClick={exportToExcel}>
                <FiDownload /> Export to Excel
              </button>
              <button className="export-btn pdf" onClick={exportToPDF}>
                <FiFileText /> Export to PDF
              </button>
            </div>
          </div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Phone</th>
                  <th>Date</th>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Visited</th>
                </tr>
              </thead>
              <tbody>
                {appointments && appointments.length > 0 ? (
                  appointments.slice(0, 10).map((appointment) => (
                    <tr key={appointment._id}>
                      <td>
                        <div className="patient-info">
                          <span className="name">{`${appointment.firstName} ${appointment.lastName}`}</span>
                          <span className="phone">{appointment.phone}</span>
                        </div>
                      </td>
                      <td>{appointment.phone}</td>
                      <td>{new Date(appointment.appointment_date).toLocaleDateString()}</td>
                      <td>{`${appointment.doctor.firstName} ${appointment.doctor.lastName}`}</td>
                      <td>{appointment.department}</td>
                      <td>
                        <select
                          className={`status-select ${appointment.status.toLowerCase()}`}
                          value={appointment.status}
                          onChange={(e) =>
                            handleUpdateStatus(appointment._id, e.target.value)
                          }
                        >
                          <option value="Pending" className="pending">
                            Pending
                          </option>
                          <option value="Accepted" className="accepted">
                            Accepted
                          </option>
                          <option value="Rejected" className="rejected">
                            Rejected
                          </option>
                        </select>
                      </td>
                      <td>
  {appointment.hasVisited === true ? (
    <GoCheckCircleFill className="green" />
  ) : (
    <AiFillCloseCircle className="red" />
  )}
</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">
                      No Appointments Found!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <style jsx>{`
        .appointments-section {
          margin: 2rem 0;
          background: white;
          border-radius: 8px;
          margin-top: -100px;
          height: 100%;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          margin-top: 10px;
        }
        
        .export-buttons {
          display: flex;
          gap: 1rem;
        }
        
        .export-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #2c7be5;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .export-btn.pdf {
          background: #e63757;
        }
        
        .table-container {
          margin-top: 10px;
          height: 500px;
          overflow-y: auto;
          border: 1px solid #e1e5eb;
          border-radius: 8px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th {
          position: sticky;
          top: 0;
          background: #f8f9fa;
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          color: #495057;
          border-bottom: 2px solid #e1e5eb;
        }
        
        td {
          padding: 12px 16px;
          border-bottom: 1px solid #e9ecef;
        }
        
        .patient-info {
          display: flex;
          flex-direction: column;
        }
        
        .patient-info .name {
          font-weight: 600;
        }
        
        .patient-info .phone {
          font-size: 0.875rem;
          color: #6e84a3;
        }
        
        .status-select {
          padding: 6px 12px;
          border-radius: 4px;
          border: 1px solid #ced4da;
          font-size: 14px;
          cursor: pointer;
        }
        
        .status-select.pending {
          background-color: #fff3cd;
          color: #856404;
        }
        
        .status-select.accepted {
          background-color: #d4edda;
          color: #155724;
        }
        
        .status-select.rejected {
          background-color: #f8d7da;
          color: #721c24;
        }
        
        .green {
          color: #28a745;
          font-size: 18px;
        }
        
        .red {
          color: #dc3545;
          font-size: 18px;
        }
        
        .no-data {
          text-align: center;
          padding: 2rem;
          color: #95aac9;
        }
      `}</style>
    </>
  );
};

export default Dashboard;