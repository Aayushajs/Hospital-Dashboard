import React, { useState } from "react";
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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAppointment, setModalAppointment] = useState(null);
  const [modalFees, setModalFees] = useState("");
  const [modalRemark, setModalRemark] = useState("");
  const [saving, setSaving] = useState(false);

  const openFeesModal = (appointment) => {
    setModalAppointment(appointment);
    setModalFees(appointment.fees ?? "");
    setModalRemark("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalAppointment(null);
    setModalFees("");
    setModalRemark("");
  };

  const saveModal = async () => {
    if (!modalAppointment) return closeModal();
    setSaving(true);
    try {
      // call parent handler - it should handle API update and toasts
      const res = handleUpdateStatus(modalAppointment._id, modalAppointment.status, modalFees);
      if (res && typeof res.then === 'function') await res;
      // remark currently not sent to API; log for now
      // TODO: if backend supports, extend handleUpdateStatus to accept remark
      console.log('Remark saved locally:', modalRemark);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
    closeModal();
  };
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
                      <button
                        type="button"
                        className="fees-open-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openFeesModal(appointment);
                        }}
                        aria-label={`Edit fees for ${appointment.firstName} ${appointment.lastName}`}
                      >
                        <FaIndianRupeeSign className="fees-icon" />
                        <span className="fees-value">{appointment.fees ?? 'Add'}</span>
                      </button>
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

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(e)=>e.stopPropagation()}>
            <h3>Edit Fees & Remark</h3>
            <div className="modal-row">
              <label>Fees</label>
              <input
                type="number"
                min="0"
                value={modalFees}
                onChange={(e)=>{
                  const v = e.target.value;
                  setModalFees(v === '' ? '' : Math.max(0, Number(v)));
                }}
                onKeyDown={(e)=>{ if(e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault(); }}
                className="modal-input"
                inputMode="numeric"
              />
            </div>
            <div className="modal-row">
              <label>Remark (optional)</label>
              <textarea
                value={modalRemark}
                onChange={(e)=>setModalRemark(e.target.value)}
                className="modal-textarea"
                rows={4}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={closeModal} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" onClick={saveModal} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        /* Fees button */
        .fees-open-btn { display:inline-flex; align-items:center; gap:0.4rem; background:#0f3460; color:#fff; border:1px solid #2d3748; padding:0.35rem 0.5rem; border-radius:6px; cursor:pointer; }
        .fees-open-btn .fees-icon { font-size:0.95rem; }
        .fees-open-btn .fees-value { font-size:0.9rem; }

        /* Modal overlay + blur - professional theme */
        .modal-overlay { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); background: rgba(2,6,23,0.55); z-index:1200; }
        .modal { width: 460px; max-width: calc(100% - 40px); background: linear-gradient(180deg, #0b1220 0%, #0f1724 100%); color:#e6eef8; border-radius:12px; padding:1rem 1.25rem; }
        .modal h3 { margin:0 0 0.6rem 0; font-size:1.05rem; letter-spacing:0.2px; color:#dbeafe; }
  .modal-row { display:flex; flex-direction:column; gap:0.4rem; margin-bottom:0.8rem; overflow:hidden; }
  .modal-input, .modal-textarea { width:100%; padding:0.6rem; border-radius:8px; border:1px solid rgba(100,116,139,0.12); background: rgba(15,23,42,0.6); color:#e6eef8; box-sizing:border-box; }
  /* keep focus simple: no colored border or glow */
  .modal-input:focus, .modal-textarea:focus { outline: none; box-shadow: none; border-color: rgba(100,116,139,0.12); }
  /* hide native number input spinners */
  .modal-input[type=number]::-webkit-outer-spin-button, .modal-input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  .modal-input[type=number] { -moz-appearance: textfield; }
        .modal-textarea { resize:vertical; min-height:90px; }
        .modal-actions { display:flex; justify-content:flex-end; gap:0.5rem; margin-top:0.25rem; overflow:hidden; }
        .btn { padding:0.5rem 0.9rem; border-radius:8px; border:none; cursor:pointer; font-weight:600; }
        .btn-primary { background: linear-gradient(90deg,#2563eb,#4f46e5); color:#fff; box-shadow: 0 6px 18px rgba(79,70,229,0.16); }
        .btn-secondary { background:transparent; color:#cbd5e1; border:1px solid rgba(148,163,184,0.06); }
        .modal label { font-size:0.85rem; color:#93c5fd; }
        @media (max-width:480px) {
          .modal { width: 92%; padding:0.75rem; }
        }
      `}</style>
    </div>
  );
};

export default DocterDashboardAppointments;
// Add scoped CSS for appointments-table
