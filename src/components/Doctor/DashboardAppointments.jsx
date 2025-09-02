import React from "react";
import { GoTrash } from "react-icons/go";
import { FiDownload, FiFileText, FiCheckCircle } from "react-icons/fi";
import { FaIndianRupeeSign } from "react-icons/fa6";
import Lottie from "lottie-react";
import animationData from "../../../public/notfountAnimation.json";
import { useNavigate } from 'react-router-dom'; // added

const DocterDashboardAppointments = ({ 
  isMobile,
  searchTerm,
  setSearchTerm,
  dateFilter,
  setDateFilter,
  statusFilter,
  setStatusFilter,
  currentAppointments,
  filteredAppointments,
  itemsPerPage,
  currentPage,
  totalPages,
  paginate,
  exportToExcel,
  exportToPDF,
  handleUpdateStatus,
  handleDeleteAppointment
}) => {
  const navigate = useNavigate();
  return (
    <div className="appointments-table">
      <div className="table-header">
        <h3>Recent Appointments</h3>
        <div className="table-controls">
          <div className="search-filter-container">
            <input
              type="text"
              placeholder="Search patients, doctors..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                currentPage(1);
              }}
              className="search-input"
            />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                currentPage(1);
              }}
              className="date-filter-wrapper"
            />
            {dateFilter && (
              <button
                onClick={() => {
                  setDateFilter("");
                  currentPage(1);
                }}
                className="clear-date"
                aria-label="Clear date filter"
              >
                ×
              </button>
            )}
            <select
              className="status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                currentPage(1);
              }}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="export-buttons">
            <button className="export-btn excel" onClick={exportToExcel}>
              <FiDownload /> {isMobile ? "" : "Excel"}
            </button>
            <button className="export-btn pdf" onClick={exportToPDF}>
              <FiFileText /> {isMobile ? "" : "PDF"}
            </button>
          </div>
        </div>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Patient</th>
              {!isMobile && <th>Date</th>}
              <th>Doctor</th>
              {!isMobile && <th>Department</th>}
              <th>Status</th>
              <th>Fees</th>
              <th>Visited</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentAppointments && currentAppointments.length > 0 ? (
              currentAppointments.map((appointment, index) => (
                <tr key={appointment._id} onClick={(e)=>{
                  // avoid triggering when interacting with controls
                  const tag = e.target.tagName.toLowerCase();
                  if(['select','option','input','button','svg','path'].includes(tag)) {
                    return;
                  }
                  navigate(`/doctor/appointment/${appointment._id}`);
                }} style={{cursor:'pointer'}}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="patient-info">
                      <span className="name">{`${appointment.firstName} ${appointment.lastName}`}</span>
                      {!isMobile && (
                        <span className="phone">{appointment.phone}</span>
                      )}
                    </div>
                  </td>
                  {!isMobile && (
                    <td>
                      {new Date(
                        appointment.appointment_date
                      ).toLocaleDateString()}
                    </td>
                  )}
                  <td>
                    {isMobile
                      ? `${appointment.doctor.firstName.charAt(0)}. ${
                          appointment.doctor.lastName
                        }`
                      : `${appointment.doctor.firstName} ${appointment.doctor.lastName}`}
                  </td>
                  {!isMobile && <td>{appointment.department}</td>}
                  <td>
                    <span
                      className={`status-badge ${appointment.status.toLowerCase()}`}
                    >
                      {appointment.status}
                    </span>
                  </td>
                  <td>
                    <div className="fees-input">
                      <FaIndianRupeeSign className="fees-icon" />
                      <input
                        type="number"
                        value={appointment.fees || ""}
                        onChange={(e) =>
                          handleUpdateStatus(
                            appointment._id,
                            appointment.status,
                            e.target.value
                          )
                        }
                        placeholder="0"
                      />
                    </div>
                  </td>
                  <td>
                    {appointment.hasVisited ? (
                      <span className="visited-yes">
                        {isMobile ? <FiCheckCircle /> : "Yes"}
                      </span>
                    ) : (
                      <span className="visited-no">
                        {isMobile ? "" : "No"}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <select
                        className="status-select"
                        value={appointment.status}
                        onChange={(e) =>
                          handleUpdateStatus(
                            appointment._id,
                            e.target.value,
                            appointment.fees
                          )
                        }
                      >
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <button
                        className="delete-btn"
                        onClick={() =>
                          handleDeleteAppointment(appointment._id)
                        }
                      >
                        <GoTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <td colSpan="10" className="no-data">
                <Lottie 
                  animationData={animationData} 
                  style={{ marginLeft:"5%", height: 200, width: 200, overflow: 'hidden' }} 
                />
                <p>No Appointments Found!</p>
              </td>
            )}
          </tbody>
        </table>
      </div>
      {filteredAppointments.length > itemsPerPage && (
        <div className="pagination">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`pagination-btn ${
                currentPage === number ? "active" : ""
              }`}
            >
              {number}
            </button>
          ))}
          
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DocterDashboardAppointments;
// Add scoped CSS for appointments-table
