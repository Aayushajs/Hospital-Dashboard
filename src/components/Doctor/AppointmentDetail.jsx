import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../api';
import { Context } from '../../main';
import { toast } from 'react-toastify';
import { FiPhone, FiUser, FiCalendar, FiArrowLeft, FiClock, FiRefreshCw } from 'react-icons/fi';
import { FaIndianRupeeSign } from 'react-icons/fa6';

// Detail page for a single appointment (doctor view)
// Theme matches existing dark dashboard. Entire page hides scrollbars using overflow hidden.
const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDoctorAuthenticated } = useContext(Context);
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const statusMeta = useMemo(() => {
    if (!appointment?.status) {
      return null;
    }
    const s = appointment.status.toLowerCase();
    const map = {
      pending: { label: 'Pending', desc: 'Awaiting confirmation', color: '#ffc107' },
      accepted: { label: 'Accepted', desc: 'Confirmed by doctor', color: '#28a745' },
      rejected: { label: 'Rejected', desc: 'Not approved', color: '#dc3545' },
      completed: { label: 'Completed', desc: 'Visit finished', color: '#0d6efd' }
    };
    return map[s] || { label: appointment.status, desc: 'Status', color: '#6c757d' };
  }, [appointment]);

  useEffect(() => {
    if (!isDoctorAuthenticated) {
      return;
    }
    const fetchOne = async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      }
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/v1/appointment/${id}`, { withCredentials: true });
        setAppointment(data.appointment || data.data || null);
        setError(null);
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load appointment';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
    fetchOne();
  }, [id, isDoctorAuthenticated]);

  if (!isDoctorAuthenticated) {
    return <div className="appt-detail-guard">Redirecting...</div>;
  }

  return (
    <div className="appointment-detail-page">
      <div className="gradient-bg" aria-hidden="true" />
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft />
          <span>Back</span>
        </button>
        <h2>Appointment Detail</h2>
        <div className="header-actions">
          <button
            className="refresh-btn"
            disabled={refreshing || loading}
            onClick={() => {
              setLoading(true); // show skeleton again
              // trigger refetch by repeating effect body manually
              (async () => {
                try {
                  const { data } = await axios.get(`${API_BASE_URL}/api/v1/appointment/${id}`, { withCredentials: true });
                  setAppointment(data.appointment || data.data || null);
                  setError(null);
                } catch (err) {
                  const msg = err.response?.data?.message || 'Failed to load appointment';
                  setError(msg);
                  toast.error(msg);
                } finally {
                  setLoading(false);
                  setRefreshing(false);
                }
              })();
            }}
          >
            <FiRefreshCw className={refreshing ? 'spin' : ''} />
            <span>{refreshing ? 'Refreshing' : 'Refresh'}</span>
          </button>
        </div>
      </div>
      {loading && (
        <div className="skeleton-wrapper" role="status" aria-label="Loading appointment details">
          {Array.from({ length: 5 }).map((_, i) => (
            <div className="skeleton-card" key={i}>
              <div className="skeleton-title" />
              <div className="skeleton-row" />
              <div className="skeleton-row short" />
              <div className="skeleton-row" />
            </div>
          ))}
        </div>
      )}
      {!loading && error && (
        <div className="error-box fade-in">{error}</div>
      )}
      {!loading && appointment && (
        <>
          <div className="summary-banner fade-in">
            <div className="left">
              <div className={`status-chip ${appointment.status?.toLowerCase()}`}>{statusMeta?.label}</div>
              <h3>{appointment.firstName} {appointment.lastName}</h3>
              <p className="status-desc">{statusMeta?.desc}</p>
            </div>
            <div className="meta">
              <div className="meta-item"><FiCalendar /> {new Date(appointment.appointment_date).toLocaleDateString()}</div>
              <div className="meta-item"><FiClock /> Created: {new Date(appointment.createdAt).toLocaleDateString()}</div>
              <div className="meta-item"><FaIndianRupeeSign /> {appointment.fees || 0}</div>
              <div className={`meta-item visit ${appointment.hasVisited ? 'yes':'no'}`}>{appointment.hasVisited ? 'Visited' : 'Not Visited'}</div>
            </div>
          </div>
          <div className="app-view fade-in">
            <div className="app-section">
              <h3 className="app-section-title">Patient Information</h3>
              <div className="app-grid">
                <div className="app-item">
                  <span className="app-key">Full Name</span>
                  <span className="app-value">{appointment.firstName} {appointment.lastName}</span>
                </div>
                <div className="app-item">
                  <span className="app-key">Gender</span>
                  <span className="app-value">{appointment.gender || 'N/A'}</span>
                </div>
                <div className="app-item">
                  <span className="app-key">Phone</span>
                  <span className="app-value">{appointment.phone || 'N/A'}</span>
                </div>
                <div className="app-item">
                  <span className="app-key">NIC</span>
                  <span className="app-value">{appointment.nic || 'N/A'}</span>
                </div>
                <div className="app-item">
                  <span className="app-key">Has Visited Before</span>
                  <span className="app-value">{appointment.hasVisited ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            <div className="app-section">
              <h3 className="app-section-title">Appointment Details</h3>
              <div className="app-grid">
                <div className="app-item">
                  <span className="app-key">Appointment Date</span>
                  <span className="app-value">{new Date(appointment.appointment_date).toLocaleString()}</span>
                </div>
                <div className="app-item">
                  <span className="app-key">Department</span>
                  <span className="app-value">{appointment.department}</span>
                </div>
                <div className="app-item">
                  <span className="app-key">Assigned Doctor</span>
                  <span className="app-value">{appointment.doctor?.firstName} {appointment.doctor?.lastName}</span>
                </div>
                <div className="app-item">
                  <span className="app-key">Status</span>
                  <span className={`app-value status-badge ${appointment.status?.toLowerCase()}`}>{appointment.status}</span>
                </div>
                <div className="app-item">
                  <span className="app-key">Consultation Fees</span>
                  <span className="app-value"><FaIndianRupeeSign /> {appointment.fees || 0}</span>
                </div>
              </div>
            </div>

            {appointment.notes && (
              <div className="app-section">
                <h3 className="app-section-title">Notes from Patient</h3>
                <p className="app-notes">{appointment.notes}</p>
              </div>
            )}

            <div className="app-section">
              <h3 className="app-section-title">Previous Appointment Summary</h3>
              <div className="summary-placeholder">
                {appointment.lastAppointmentSummary ? (
                  <p className="app-notes">{appointment.lastAppointmentSummary}</p>
                ) : (
                  <p>No records of previous visits found. This appears to be the patient's first visit.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      <style jsx="true">{`
  .appointment-detail-page {position:relative;background:#0f1629;color:#e9ecef;min-height:100vh;padding:1.2rem 2.2rem;margin-left:var(--sidebar-shift,0);transition:margin-left .32s cubic-bezier(.4,0,.2,1);overflow:hidden;font-family:'Inter',sans-serif;}
        @media (max-width:1200px){.appointment-detail-page{margin-left:0;padding:1.2rem 1.2rem;}}
        .gradient-bg{position:absolute;inset:0;background:radial-gradient(circle at 25% 15%,rgba(77,124,254,0.15),transparent 60%),radial-gradient(circle at 85% 70%,rgba(13,110,253,0.12),transparent 65%);pointer-events:none;}
        .detail-header{position:relative;z-index:2;display:flex;align-items:center;gap:1rem;margin-bottom:1.2rem;flex-wrap:wrap;}
        .detail-header h2{margin:0;font-size:1.5rem;font-weight:600;background:linear-gradient(90deg,#fff,#b8d4ff);-webkit-background-clip:text;color:transparent;letter-spacing:.5px;}
        .back-btn{display:inline-flex;align-items:center;gap:.5rem;background:#13294a;border:1px solid #1f3a63;color:#fff;padding:.55rem 1rem;border-radius:10px;cursor:pointer;font-size:.8rem;font-weight:500;transition:.3s;box-shadow:0 4px 12px -2px rgba(0,0,0,.4);}
        .back-btn:hover{background:#1b3b68;transform:translateY(-2px);} .back-btn:active{transform:translateY(0);}
        .header-actions{margin-left:auto;display:flex;align-items:center;gap:.75rem;}
        .refresh-btn{display:inline-flex;align-items:center;gap:.45rem;background:#16213e;border:1px solid #28406b;color:#d2d9e5;padding:.5rem .9rem;font-size:.8rem;text-transform:uppercase;letter-spacing:.7px;border-radius:8px;cursor:pointer;transition:.25s;font-weight:600;}
        .refresh-btn:hover:not(:disabled){background:#1f2f4e;color:#fff;} .refresh-btn:disabled{opacity:.5;cursor:not-allowed;}
        .refresh-btn .spin{animation:spin 1s linear infinite;} @keyframes spin{to{transform:rotate(360deg);}}
        /* Skeleton */
        .skeleton-wrapper{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1.1rem;margin-top:.5rem;}
        .skeleton-card{background:#16213e;border:1px solid #21304a;border-radius:14px;padding:1rem;overflow:hidden;position:relative;}
        .skeleton-card:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent);animation:shimmer 1.8s infinite;}
        .skeleton-title{height:16px;width:45%;background:#20324d;border-radius:6px;margin-bottom:.9rem;}
        .skeleton-row{height:10px;background:#1f3352;border-radius:5px;margin:.5rem 0;}
        .skeleton-row.short{width:60%;}
        @keyframes shimmer{0%{transform:translateX(-100%);}100%{transform:translateX(100%);}}
        .error-box{background:#40202c;color:#ff6b6b;padding:1rem .95rem;border:1px solid #ff6b6b50;border-radius:12px;font-size:.8rem;box-shadow:0 4px 14px -3px rgba(255,107,107,.25);}        
        .summary-banner{position:relative;z-index:2;background:linear-gradient(120deg,#142844,#1d3557 55%,#16213e);border:1px solid #234066;border-radius:20px;padding:1.2rem 1.4rem;display:flex;flex-wrap:wrap;gap:1.6rem;align-items:center;margin-bottom:1.4rem;box-shadow:0 8px 28px -6px rgba(0,0,0,.55);}        
        .summary-banner .left h3{margin:.1rem 0 .4rem;font-size:1.25rem;font-weight:600;color:#fff;letter-spacing:.5px;}
        .status-chip{display:inline-block;padding:.45rem .85rem;border-radius:30px;font-size:.6rem;font-weight:700;letter-spacing:.85px;text-transform:uppercase;background:#20324d;color:#c5d3e6;margin-bottom:.5rem;box-shadow:0 2px 6px -1px rgba(0,0,0,.4);}
        .status-chip.pending{background:rgba(255,193,7,.15);color:#ffc107;}
        .status-chip.accepted{background:rgba(40,167,69,.15);color:#28a745;}
        .status-chip.completed{background:rgba(13,110,253,.15);color:#0d6efd;}
        .status-chip.rejected{background:rgba(220,53,69,.15);color:#dc3545;}
        .status-desc{margin:0;font-size:.7rem;opacity:.7;letter-spacing:.6px;}
        .summary-banner .meta{display:flex;flex-wrap:wrap;gap:.8rem;align-items:center;margin-left:auto;}
        .meta-item{display:flex;align-items:center;gap:.4rem;font-size:.78rem;background:#0f3460;border:1px solid #254570;padding:.45rem .75rem;border-radius:10px;color:#d5dde9;font-weight:500;letter-spacing:.5px;}
        .meta-item.visit.yes{background:rgba(40,167,69,.15);color:#28a745;border-color:#28a74540;}
        .meta-item.visit.no{background:rgba(220,53,69,.15);color:#dc3545;border-color:#dc354540;}
        
        /* New App View Styles */
        .app-view {
          background: #111d33;
          border: 1px solid #1f3352;
          border-radius: 16px;
          padding: 1rem;
          max-height: calc(100vh - 220px);
          overflow-y: auto;
          scrollbar-width: none; /* Firefox */
        }
        .app-view::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }

        .app-section {
          margin-bottom: 1.75rem;
        }
        .app-section:last-child {
          margin-bottom: 0;
        }

        .app-section-title {
          font-size: 1rem;
          font-weight: 600;
          color: #4d8dff;
          margin: 0 0 1.2rem;
          padding-bottom: 0.6rem;
          border-bottom: 1px solid #1f3352;
          letter-spacing: .5px;
        }

        .app-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1rem;
        }

        .app-item {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          padding: 0.8rem 1rem;
          border-radius: 10px;
          
        }

        .app-key {
          font-size: 0.8rem;
          color: #a0b3d0;
          text-transform: uppercase;
          letter-spacing: .8px;
        }

        .app-value {
          font-size: 0.85rem;
          font-weight: 500;
          color: #e9ecef;
          display: flex;
          align-items: center;
          gap: .4rem;
        }
        
        .status-badge {
          display: inline-block;
          padding: .3rem .7rem;
          border-radius: 20px;
          font-size: .7rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        .status-badge.pending{color:#ffc107; }        
        .status-badge.accepted{color:#28a745;}        
        .status-badge.completed{color:#0d6efd;}        
        .status-badge.rejected{color:#dc3545;}

        .app-notes {
          font-size: 0.8rem;
          line-height: 1.6;
          background: #0f223d;
          padding: 1rem;
          border-radius: 10px;
          border: 1px solid #1d3b60;
          white-space: pre-wrap;
          color: #c5d3e6;
        }

        .summary-placeholder {
          background: #0f223d;
          border: 1px dashed #1d3b60;
          padding: 1.5rem;
          border-radius: 10px;
          text-align: center;
          color: #a0b3d0;
          font-size: 0.8rem;
        }

        @media (max-width: 768px) {
          .app-view {
            padding: 1rem;
            max-height: none;
          }
          .app-grid {
            grid-template-columns: 1fr;
          }
        }

        .fade-in{animation:fade .5s ease;} @keyframes fade{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
      `}</style>
    </div>
  );
};

export default AppointmentDetail;
