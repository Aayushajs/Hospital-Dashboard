import React from "react";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
import { FiCalendar, FiUser, FiClock } from "react-icons/fi";

const DashboardStats = ({ 
  isMobile, 
  stats, 
  appointmentsCount, 
  doctorsCount, 
  patientsCount,
  miniLineGraphData,
  appointmentStatusData,
  monthlyAppointmentsData,
  doctorsSpecializationData,
  weeklyVisitsData,
  revenueByDepartmentData,
  patientAgeDistributionData
}) => {
  return (
    <>
      <div className="stats-grid">
        <div className="stat-card total-appointments">
          <div className="stat-content">
            <div className="stat-icon">
              <FiCalendar />
            </div>
            <div className="stat-info">
              <h3>{appointmentsCount}</h3>
              <p>Total Appointments</p>
            </div>
          </div>
          <div className="mini-graph">
            <Line
              data={miniLineGraphData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { display: false }, y: { display: false } },
              }}
            />
          </div>
        </div>

        <div className="stat-card doctors">
          <div className="stat-content">
            <div className="stat-icon">
              <FiUser />
            </div>
            <div className="stat-info">
              <h3>{doctorsCount}</h3>
              <p>Registered Doctors</p>
            </div>
          </div>
          <div className="mini-graph">
            <Line
              data={miniLineGraphData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { display: false }, y: { display: false } },
              }}
            />
          </div>
        </div>

        <div className="stat-card patients">
          <div className="stat-content">
            <div className="stat-icon">
              <FiUser />
            </div>
            <div className="stat-info">
              <h3>{patientsCount}</h3>
              <p>Registered Patients</p>
            </div>
          </div>
          <div className="mini-graph">
            <Line
              data={miniLineGraphData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { display: false }, y: { display: false } },
              }}
            />
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-content">
            <div className="stat-icon">
              <FiClock />
            </div>
            <div className="stat-info">
              <h3>{stats.pending}</h3>
              <p>Pending Appointments</p>
            </div>
          </div>
          <div className="mini-graph">
            <Line
              data={miniLineGraphData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { display: false }, y: { display: false } },
              }}
            />
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h4>Appointment Status</h4>
          <div className="chart-container">
            <Doughnut
              data={appointmentStatusData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: isMobile ? "bottom" : "right",
                    labels: {
                      color: "#e9ecef",
                      font: {
                        size: 10,
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h4>Monthly Appointments</h4>
          <div className="chart-container">
            <Line
              data={monthlyAppointmentsData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: "rgba(255, 255, 255, 0.1)",
                    },
                    ticks: {
                      color: "#e9ecef",
                      font: { size: 10 },
                    },
                  },
                  x: {
                    grid: {
                      color: "rgba(255, 255, 255, 0.1)",
                    },
                    ticks: {
                      color: "#e9ecef",
                      font: { size: 10 },
                    },
                  },
                },
                plugins: {
                  legend: {
                    labels: {
                      color: "#e9ecef",
                      font: { size: 10 },
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h4>Revenue by Department</h4>
          <div className="chart-container">
            <Bar
              data={revenueByDepartmentData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: "rgba(255, 255, 255, 0.1)",
                    },
                    ticks: {
                      color: "#e9ecef",
                      font: { size: 10 },
                      callback: function (value) {
                        return "₹" + value.toLocaleString();
                      },
                    },
                  },
                  x: {
                    grid: {
                      color: "rgba(255, 255, 255, 0.1)",
                    },
                    ticks: {
                      color: "#e9ecef",
                      font: { size: 10 },
                    },
                  },
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h4>Patient Age Distribution</h4>
          <div className="chart-container">
            <Pie
              data={patientAgeDistributionData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: isMobile ? "bottom" : "right",
                    labels: {
                      color: "#e9ecef",
                      font: {
                        size: 10,
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
        <div className="chart-card">
          <h4> Doctors Specialization </h4>
          <div className="chart-container">
            <Bar
              data={doctorsSpecializationData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: isMobile ? "bottom" : "right",
                    display: false,
                    labels: {
                      color: "#e9ecef",
                      font: {
                        size: 10,
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
        <div className="chart-card">
          <h4>weekly Visits Data</h4>
          <div className="chart-container">
            <Bar
              data={weeklyVisitsData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: isMobile ? "bottom" : "right",
                    display: false,
                    labels: {
                      color: "#e9ecef",
                      font: {
                        size: 10,
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardStats;