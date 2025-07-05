import React, { useState } from "react";
import { FiMail, FiPhone, FiUser, FiUsers } from "react-icons/fi";

const DashboardAdmins = ({ admins, adminsLoading, admin }) => {
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  return (
    <>
      {adminsLoading ? (
        <div className="admins-skeleton">
          {[1, 2, 3].map((item) => (
            <div key={item} className="skeleton-admin-card">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-info">
                <div className="skeleton-line"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line"></div>
              </div>
              <div className="skeleton-badge"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="admins-container">
          <h3>Admin Team</h3>
          <div className="admins-grid">
            {admins.map((adminItem) => (
              <div 
                key={adminItem._id} 
                onClick={() => setSelectedAdmin(adminItem)} 
                className="admin-card"
              >
                <div className="admin-avatar">
                  {adminItem.firstName.charAt(0).toUpperCase()}
                  {adminItem.lastName.charAt(0).toUpperCase()}
                </div>
                <div className="admin-info">
                  <h4>
                    {adminItem.firstName} {adminItem.lastName}
                    {adminItem._id === admin?._id && (
                      <span className="you-badge">You</span>
                    )}
                  </h4>
                  <div className="admin-detail">
                    <FiMail className="icon" />
                    <span>{adminItem.email}</span>
                  </div>
                  <div className="admin-detail">
                    <FiPhone className="icon" />
                    <span>{adminItem.phone}</span>
                  </div>
                  <div className="admin-detail">
                    <FiUser className="icon" />
                    <span>{adminItem.gender}</span>
                  </div>
                </div>
                <div className="admin-stats">
                  <FiUsers className="stat-icon" />
                  <span className="stat-value">
                    {adminItem.doctorsCreatedCount}
                  </span>
                  <span className="stat-label">Doctors</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedAdmin && (
        <div className="admin-popup-overlay">
          <div className="admin-popup">
            <button 
              className="close-popup"
              onClick={() => setSelectedAdmin(null)}
            >
              ×
            </button>
            
            <div className="popup-header">
              <div className="popup-avatar">
                {selectedAdmin.firstName.charAt(0).toUpperCase()}
                {selectedAdmin.lastName.charAt(0).toUpperCase()}
              </div>
              <h3>
                {selectedAdmin.firstName} {selectedAdmin.lastName}
                {selectedAdmin._id === admin?._id && (
                  <span className="you-badge">You</span>
                )}
              </h3>
              <p>Administrator</p>
            </div>
            
            <div className="popup-details">
              <div className="detail-item">
                <FiMail className="icon" />
                <span>{selectedAdmin.email}</span>
              </div>
              
              <div className="detail-item">
                <FiPhone className="icon" />
                <span>{selectedAdmin.phone}</span>
              </div>
              
              <div className="detail-item">
                <FiUser className="icon" />
                <span>{selectedAdmin.gender}</span>
              </div>
              
              <div className="detail-item">
                <FiUsers className="icon" />
                <span>Created {selectedAdmin.doctorsCreatedCount} Doctors</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardAdmins;