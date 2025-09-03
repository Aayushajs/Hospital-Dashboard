import React from "react";

const DashboardSkeleton = () => (
  <div className="dashboard-container DoctorDashboardMain">
    <div className="skeleton-loader">
      {/* Top Header Skeleton */}
      <div className="skeleton-header">
        <div className="skeleton-text" style={{ width: "200px", height: "24px" }}></div>
        <div className="skeleton-actions">
          <div className="skeleton-icon"></div>
          <div className="skeleton-avatar"></div>
        </div>
      </div>
      {/* Welcome Section Skeleton */}
      <div className="skeleton-welcome">
        <div className="skeleton-text" style={{ width: "150px", height: "28px" }}></div>
        <div className="skeleton-text" style={{ width: "250px", height: "18px", marginTop: "8px" }}></div>
      </div>
      {/* Stats Grid Skeleton */}
      <div className="skeleton-stats-grid">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="skeleton-stat-card">
            <div className="skeleton-stat-content">
              <div className="skeleton-stat-icon"></div>
              <div className="skeleton-stat-info">
                <div className="skeleton-text" style={{ width: "40px", height: "24px" }}></div>
                <div className="skeleton-text" style={{ width: "100px", height: "16px", marginTop: "8px" }}></div>
              </div>
            </div>
            <div className="skeleton-mini-graph"></div>
          </div>
        ))}
      </div>
      {/* Charts Grid Skeleton */}
      <div className="skeleton-charts-grid">
        {[1, 2].map((item) => (
          <div key={item} className="skeleton-chart-card">
            <div className="skeleton-chart-title"></div>
            <div className="skeleton-chart"></div>
          </div>
        ))}
      </div>
      {/* Table Skeleton */}
      <div className="skeleton-table">
        <div className="skeleton-table-header">
          <div className="skeleton-text" style={{ width: "120px", height: "20px" }}></div>
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
    <style jsx>{`
      .skeleton-loader {
        padding: 1.5rem;
        margin-left: var(--sidebar-shift,0);
        transition: margin-left .32s cubic-bezier(.4,0,.2,1);
        background-color: rgba(32, 32, 52, 0.92);
        min-height: 100vh;
      }
      .skeleton-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(48, 59, 77, 0.9);
      }
      .skeleton-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .skeleton-icon, .skeleton-avatar, .skeleton-text, 
      .skeleton-mini-graph, .skeleton-chart, .skeleton-button,
      .skeleton-table-row {
        background: linear-gradient(90deg, #2d3748 25%, #1a202c 50%, #2d3748 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }
      .skeleton-icon {
        width: 24px;
        height: 24px;
        border-radius: 50%;
      }
      .skeleton-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
      }
      .skeleton-text {
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
      }
      .skeleton-stat-info {
        flex: 1;
      }
      .skeleton-mini-graph {
        height: 50px;
        width: 100%;
        margin-top: 0.5rem;
        border-radius: 4px;
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
        border-radius: 4px;
      }
      .skeleton-chart {
        height: 220px;
        border-radius: 4px;
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
      }
      .skeleton-table-content {
        margin-top: 1rem;
      }
      .skeleton-table-row {
        height: 50px;
        border-radius: 4px;
        margin-bottom: 0.5rem;
      }
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
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

export default DashboardSkeleton;
