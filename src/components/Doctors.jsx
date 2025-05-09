import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import { FiSearch, FiFilter, FiDownload } from "react-icons/fi";
import { FaUserMd, FaCalendarAlt, FaPhone, FaEnvelope, FaIdCard } from "react-icons/fa";
import { GiDoctorFace } from "react-icons/gi";
import * as XLSX from "xlsx";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const { isAuthenticated } = useContext(Context);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get(
         // "http://localhost:4000/api/v1/user/doctors",
          "https://jainam-hospital-backend.onrender.com/api/v1/user/doctors",
          { withCredentials: true }
        );
        setDoctors(data.doctors);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch doctors");
      }
    };
    fetchDoctors();
  }, []);

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  // Get unique departments for filter
  const departments = [...new Set(doctors.map(doctor => doctor.doctorDepartment))];

  // Filter doctors based on search and department
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = `${doctor.firstName} ${doctor.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === "all" || 
      doctor.doctorDepartment === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  // Function to export doctors data to Excel
  const exportToExcel = () => {
    // Prepare data for export
    const dataToExport = filteredDoctors.map(doctor => ({
      "Doctor Name": `Dr. ${doctor.firstName} ${doctor.lastName}`,
      "Department": doctor.doctorDepartment,
      "Email": doctor.email,
      "Phone": doctor.phone || "Not provided",
      "Date of Birth": doctor.dob?.substring(0, 10) || "N/A",
      "Gender": doctor.gender || "N/A",
      "NIC": doctor.nic || "N/A"
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Doctors List");

    // Generate file and trigger download
    XLSX.writeFile(workbook, "Doctors_List.xlsx", { compression: true });
  };

  return (
    <section className="doctors-page">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <GiDoctorFace className="icon" />
            Our Medical Team
          </h1>
          <p className="subtitle">Meet our qualified and experienced doctors</p>
        </div>
        
        <div className="controls">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-box">
            <FiFilter className="filter-icon" />
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
          
          <button className="export-btn" onClick={exportToExcel}>
            <FiDownload /> Export List
          </button>
        </div>
      </div>

      <div className="doctors-grid">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor) => (
            <div className="doctor-card" key={doctor._id}>
              <div className="card-header">
                <div className="avatar-container">
                  <img
                    src={doctor.docAvatar?.url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwr3lHpzDsMZR4UXD7DM2qO1fYUGjh_lNiOQ&s"}
                    alt={`${doctor.firstName} ${doctor.lastName}`}
                    className="doctor-avatar"
                    onError={(e) => {
                      e.target.src = "/default-doctor.jpg";
                    }}
                  />
                  <div className="online-status"></div>
                </div>
                <h3>{`Dr. ${doctor.firstName} ${doctor.lastName}`}</h3>
                <p className="department">{doctor.doctorDepartment}</p>
              </div>
              
              <div className="card-body">
                <div className="detail-item">
                  <FaEnvelope className="detail-icon" />
                  <span>{doctor.email}</span>
                </div>
                
                <div className="detail-item">
                  <FaPhone className="detail-icon" />
                  <span>{doctor.phone || "Not provided"}</span>
                </div>
                
                <div className="detail-item">
                  <FaCalendarAlt className="detail-icon" />
                  <span>{doctor.dob?.substring(0, 10) || "N/A"}</span>
                </div>
                
                <div className="detail-item">
                  <FaUserMd className="detail-icon" />
                  <span>{doctor.gender || "N/A"}</span>
                </div>
                
                <div className="detail-item">
                  <FaIdCard className="detail-icon" />
                  <span>{doctor.nic || "N/A"}</span>
                </div>
              </div>
              
              <div className="card-footer">
                <button className="view-profile">View Profile</button>
                <button className="book-appointment">Book Appointment</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-doctors">
            <GiDoctorFace className="no-doctors-icon" />
            <h3>No Doctors Found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Doctors;