import { API_BASE_URL } from "../api";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { FiPrinter } from "react-icons/fi";
import { ArrowBack } from '@mui/icons-material';
import FloatingCalculatorButton from "./FloatingButton"; // Import the FloatingCalculatorButton component
const DescriptionBill = () => {
  const { state } = useLocation();
  const { description } = state || {};
  const navigate = useNavigate();

  if (!description) {
    return (
      <div className="bill-error-container">
        No description data found. Please go back to the previous page.
        <button
          onClick={() => navigate(-1)}
          className="bill-error-button"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid Date';
    }
  };

  return (
    <div className="bill-wrapper">
        <FloatingCalculatorButton /> {/* Include the FloatingCalculatorButton component */}
      <button
        onClick={() => navigate(-1)}
        className="bill-back-button"
      >
        <ArrowBack style={{ fontSize: '20px' }} />
        Back to Description
      </button>

      <div className="bill-main-container">
        <div className="bill-header-section">
          <h1 className="bill-title">Medical Description Bill</h1>
          <button onClick={handlePrint} className="bill-print-button">
            <FiPrinter /> Print Bill
          </button>
        </div>

        <div className="bill-hospital-info">
          <h2 className="bill-hospital-name">Jainam Hospital</h2>
          <p className="bill-hospital-address">123 Medical Street, Healthcare City</p>
          <p className="bill-hospital-phone">Phone: +91 9876543210</p>
        </div>

        <div className="bill-patient-doctor-container">
          <div className="bill-info-card">
            <h3 className="bill-info-title">Patient Details</h3>
            <p><strong>Name:</strong> {description.patientId?.firstName || 'N/A'} {description.patientId?.lastName || ''}</p>
            <p><strong>Patient ID:</strong> {description.patientId?._id || 'N/A'}</p>
          </div>
          <div className="bill-info-card">
            <h3 className="bill-info-title">Doctor Details</h3>
            <p><strong>Name:</strong> {description.doctorId?.firstName || 'N/A'} {description.doctorId?.lastName || ''}</p>
            <p><strong>Department:</strong> {description.doctorId?.doctorDepartment || 'N/A'}</p>
          </div>
        </div>

        <div className="bill-medical-info">
          <h3 className="bill-section-title">Medical Information</h3>
          <div className="bill-info-grid">
            <p><strong>Diagnosis:</strong> {description.diagnosis || 'N/A'}</p>
            <p><strong>ICD Code:</strong> {description.icdCode || 'N/A'}</p>
            <p><strong>Date:</strong> {formatDate(description.date)}</p>
            <p><strong>Appointment ID:</strong> {description.appointmentId || 'N/A'}</p>
          </div>
        </div>

        <div className="bill-vitals-section">
          <h3 className="bill-section-title">Vital Signs</h3>
          <div className="bill-vitals-grid">
            <div><strong>Blood Pressure:</strong> {description.vitalSigns?.bloodPressure || 'N/A'}</div>
            <div><strong>Pulse:</strong> {description.vitalSigns?.pulse ? `${description.vitalSigns.pulse} bpm` : 'N/A'}</div>
            <div><strong>Temperature:</strong> {description.vitalSigns?.temperature ? `${description.vitalSigns.temperature} °F` : 'N/A'}</div>
            <div><strong>Height:</strong> {description.vitalSigns?.height ? `${description.vitalSigns.height} cm` : 'N/A'}</div>
            <div><strong>Weight:</strong> {description.vitalSigns?.weight ? `${description.vitalSigns.weight} kg` : 'N/A'}</div>
            <div><strong>BMI:</strong> {description.vitalSigns?.bmi || 'N/A'}</div>
          </div>
        </div>

        <div className="bill-medicines-section">
          <h3 className="bill-section-title">Prescribed Medicines</h3>
          {description.medicines?.length > 0 ? (
            <div className="bill-table-container">
              <table className="bill-data-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {description.medicines.map((medicine, index) => (
                    <tr key={index}>
                      <td>{medicine.name || '-'}</td>
                      <td>{medicine.dosage || '-'}</td>
                      <td>{medicine.frequency || '-'}</td>
                      <td>{medicine.duration || '-'}</td>
                      <td>{medicine.instructions || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="bill-no-data">No medicines prescribed.</p>
          )}
        </div>

        <div className="bill-tests-section">
          <h3 className="bill-section-title">Prescribed Tests</h3>
          {description.testsPrescribed?.length > 0 ? (
            <div className="bill-table-container">
              <table className="bill-data-table">
                <thead>
                  <tr>
                    <th>Test Name</th>
                    <th>Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {description.testsPrescribed.map((test, index) => (
                    <tr key={index}>
                      <td>{test.name || '-'}</td>
                      <td>{test.instructions || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="bill-no-data">No tests prescribed.</p>
          )}
        </div>

        <div className="bill-fees-section">
          <h3 className="bill-section-title">Fee Details</h3>
          <div className="bill-fee-summary">
            <div className="bill-fee-row">
              <span>Consultation Fee:</span>
              <span><FaIndianRupeeSign /> {description.fee?.consultationFee || '0.00'}</span>
            </div>
            <div className="bill-fee-row">
              <span>Medication Fee:</span>
              <span><FaIndianRupeeSign /> {description.fee?.medicationFee || '0.00'}</span>
            </div>
            <div className="bill-fee-row bill-total-fee">
              <span>Total Fee:</span>
              <span><FaIndianRupeeSign /> {description.fee?.totalFee || '0.00'}</span>
            </div>
            <div className="bill-fee-row">
              <span>Payment Status:</span>
              <span className={`bill-status bill-status-${description.paymentStatus?.toLowerCase() || 'unknown'}`}>
                {description.paymentStatus || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="bill-notes-section">
          <h3 className="bill-section-title">Additional Information</h3>
          <p><strong>Clinical Notes:</strong> {description.clinicalNotes || 'N/A'}</p>
          <p><strong>Follow-up Instructions:</strong> {description.followUpInstructions || 'N/A'}</p>
          <p><strong>Next Visit:</strong> {description.nextVisit ? formatDate(description.nextVisit) : 'Not scheduled'}</p>
        </div>
      </div>

      <style jsx>{`
        .bill-wrapper {
          background-color: #1a1a2e;
          min-height: 100vh;
          padding: 24px;
          color: #e9ecef;
        }

        .bill-error-container {
          padding: 20px;
          color: #e9ecef;
          text-align: center;
          margin-top: 50px;
          background-color: #1a1a2e;
          min-height: 100vh;
        }

        .bill-error-button {
          display: block;
          margin: 20px auto;
          padding: 10px 20px;
          background-color: #4d7cfe;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
        }

        .bill-back-button {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          padding: 10px 18px;
          background-color: #2c3e50;
          color: #e9ecef;
          border: 1px solid #3a4a6b;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.95rem;
          transition: background-color 0.3s ease;
        }

        .bill-back-button:hover {
          background-color: #34495e;
        }

        .bill-main-container {
          max-width: 900px;
          width: 100%;
          margin: 0 auto;
          padding: 10px;
          background: #16213e;
          color: #e9ecef;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }

        .bill-header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid #3a4a6b;
        }

        .bill-title {
          font-size: 2rem;
          color: #e9ecef;
          margin: 0;
        }

        .bill-print-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #4d7cfe;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          transition: background-color 0.3s ease;
        }

        .bill-print-button:hover {
          background: #3a68d9;
        }

        .bill-hospital-info {
          text-align: center;
          margin-bottom: 2rem;
        }

        .bill-hospital-name {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .bill-hospital-address,
        .bill-hospital-phone {
          font-size: 1.1rem;
          margin: 0.4rem 0;
          color: #b0c2d9;
        }

        .bill-patient-doctor-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
          margin-bottom: 2rem;
        }

        .bill-info-card {
          background-color: #0f3460;
          border-radius: 8px;
          padding: 20px;
          box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
        }

        .bill-info-title {
          color: #e9ecef;
          margin-top: 0;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .bill-info-card p {
          margin: 0.75rem 0;
          color: #c0d1e7;
        }

        .bill-info-card strong {
          color: #e9ecef;
        }

        .bill-medical-info,
        .bill-vitals-section {
          margin-bottom: 2rem;
        }

        .bill-section-title {
          color: #e9ecef;
          margin-top: 0;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .bill-info-grid,
        .bill-vitals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          background-color: #0f3460;
          border-radius: 8px;
          padding: 20px;
          box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
        }

        .bill-info-grid p,
        .bill-vitals-grid div {
          margin: 0;
          color: #c0d1e7;
        }

        .bill-info-grid strong,
        .bill-vitals-grid strong {
          color: #e9ecef;
        }

        .bill-table-container {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .bill-data-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1.5rem;
          background-color: #0f3460;
          border-radius: 8px;
          overflow: hidden;
          min-width: 600px;
        }

        .bill-data-table th, 
        .bill-data-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #2a3d5f;
          color: #c0d1e7;
        }

        .bill-data-table th {
          background: #2a3d5f;
          color: #e9ecef;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.9rem;
        }

        .bill-data-table tr:last-child td {
          border-bottom: none;
        }

        .bill-no-data {
          text-align: center;
          font-style: italic;
          color: #b0c2d9;
          padding: 1rem;
          background-color: #0f3460;
          border-radius: 8px;
        }

        .bill-fees-section {
          background-color: #0f3460;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          margin-bottom: 2rem;
        }

        .bill-fee-summary {
          max-width: 500px;
          margin: 0 auto;
        }

        .bill-fee-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid #2a3d5f;
          font-size: 1.1rem;
        }

        .bill-fee-row:last-of-type {
          border-bottom: none;
        }

        .bill-total-fee {
          font-weight: bold;
          font-size: 1.4rem;
          border-top: 2px solid #4d7cfe;
          padding-top: 1rem;
          margin-top: 1rem;
          color: #4d7cfe;
        }

        .bill-fee-row span:last-child {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .bill-status {
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 0.9rem;
        }

        .bill-status-paid {
          background: #28a745;
          color: white;
        }

        .bill-status-unpaid {
          background: #dc3545;
          color: white;
        }

        .bill-status-unknown {
          background: #ffc107;
          color: #333;
        }

        .bill-notes-section p {
          margin: 0.75rem 0;
          color: #c0d1e7;
        }

        /* Print Specific Styles */
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: white !important;
            color: black !important;
          }
          .bill-wrapper {
            background-color: white !important;
            color: black !important;
            padding: 0;
          }
          .bill-back-button, 
          .bill-print-button {
            display: none !important;
          }
          .bill-main-container {
            box-shadow: none !important;
            padding: 0 !important;
            background: white !important;
            color: black !important;
            border-radius: 0 !important;
          }
          .bill-title,
          .bill-section-title,
          .bill-info-card strong,
          .bill-data-table th,
          .bill-total-fee {
            color: black !important;
          }
          .bill-info-card,
          .bill-info-grid,
          .bill-vitals-grid,
          .bill-data-table,
          .bill-fees-section,
          .bill-no-data {
            background-color: #f9f9f9 !important;
            border: 1px solid #eee !important;
            box-shadow: none !important;
          }
          .bill-info-card p,
          .bill-info-grid p,
          .bill-vitals-grid div,
          .bill-data-table td,
          .bill-notes-section p {
            color: #333 !important;
          }
          .bill-fee-row {
            border-bottom: 1px solid #ddd !important;
          }
          .bill-total-fee {
            border-top: 2px solid #888 !important;
          }
          .bill-status-paid {
            background: #d4edda !important;
            color: #155724 !important;
          }
          .bill-status-unpaid {
            background: #f8d7da !important;
            color: #721c24 !important;
          }
          .bill-status-unknown {
            background: #fff3cd !important;
            color: #856404 !important;
          }
        }

        /* Responsive Adjustments */
        @media (max-width: 992px) {
          .bill-main-container {
            max-width: 90%;
          }
        }

        @media (max-width: 768px) {
          .bill-wrapper {
            padding: 15px;
          }
          .bill-main-container {
            padding: 20px;
            max-width: 100%;
          }
          .bill-patient-doctor-container {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          .bill-vitals-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .bill-data-table th, 
          .bill-data-table td {
            padding: 0.75rem;
            font-size: 0.85rem;
          }
          .bill-fee-summary {
            max-width: 100%;
          }
          .bill-title {
            font-size: 1.8rem;
          }
          .bill-print-button {
            padding: 0.6rem 1.2rem;
            font-size: 0.9rem;
          }
        }

        @media (max-width: 576px) {
          .bill-wrapper {
            padding: 10px;
          }
          .bill-main-container {
            padding: 15px;
          }
          .bill-header-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
          }
          .bill-title {
            font-size: 1.5rem;
          }
          .bill-print-button {
            width: 100%;
            justify-content: center;
            font-size: 0.85rem;
            padding: 0.6rem 1rem;
          }
          .bill-vitals-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .bill-section-title {
            font-size: 1.2rem;
            margin-bottom: 0.8rem;
          }
          .bill-hospital-name,
          .bill-info-card p,
          .bill-info-grid p,
          .bill-vitals-grid div,
          .bill-notes-section p {
            font-size: 0.95rem;
          }
          .bill-fee-row {
            font-size: 1rem;
            padding: 0.6rem 0;
          }
          .bill-total-fee {
            font-size: 1.2rem;
            padding-top: 0.8rem;
            margin-top: 0.8rem;
          }
          .bill-status {
            font-size: 0.8rem;
            padding: 0.3rem 0.6rem;
          }
          .bill-data-table {
            min-width: unset;
          }
        }
      `}</style>
    </div>
  );
};

export default DescriptionBill;