import React from "react";
import { FiBell, FiChevronDown } from "react-icons/fi";

const DashboardHeader = ({ user, isMobile, navigate }) => (
  <div className="dashboard-top-header">
    <div className="header-title">
      <h1>Dashboard</h1>
      <p>Welcome back, <span className="doctor-name">{user?.firstName} {user?.lastName}</span></p>
    </div>
    <div className="header-actions">
      <button className="notification-btn">
        <div className="notification-icon">
          <FiBell />
        </div>
      </button>
      <div 
        className="profile-btn" 
        onClick={() => navigate("/doctor/profile")}
      >
        <div className="avatar">
          {user?.firstName?.charAt(0).toUpperCase()}
          {user?.lastName?.charAt(0).toUpperCase()}
        </div>
        {!isMobile && (
          <div className="profile-info">
            <span className="profile-name">{user?.firstName}</span>
            <span className="profile-role">Doctor</span>
          </div>
        )}
        {!isMobile && <FiChevronDown className="dropdown-icon" />}
      </div>
    </div>
    <style jsx>{`
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
      .doctor-name {
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
        }
        .avatar {
          width: 36px;
          height: 36px;
          font-size: 0.9rem;
        }
      }
    `}</style>
  </div>
);

export default DashboardHeader;
