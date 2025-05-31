import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Lottie from 'lottie-react';
import profileAnimation from '../../public/profile-animation.json';
import loadingAnimation from '../../public/loding.json';
import { FiEdit, FiSave, FiMail, FiPhone, FiUser, FiCalendar, FiCreditCard, FiDownload } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const ProfilePage = () => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nic: '',
    dob: '',
    gender: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const navigate = useNavigate();
  const idCardRef = useRef(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data } = await axios.get(
          'https://jainam-hospital-backend.onrender.com/api/v1/user/admin/me',
          { withCredentials: true }
        );
        setUserData(data.user);
        setLoading(false);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error fetching profile data');
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const { data } = await axios.put(
        'https://jainam-hospital-backend.onrender.com/api/v1/user/admin/update',
        userData,
        { withCredentials: true }
      );
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating profile');
    }
  };

  const downloadIDCard = async () => {
    setIsGeneratingPDF(true);
    try {
      idCardRef.current.style.display = 'block';
      
      const canvas = await html2canvas(idCardRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: null,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a5');
      const imgWidth = 148;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${userData.firstName}_${userData.lastName}_ID_Card.pdf`);
    } catch (error) {
      toast.error('Failed to generate ID card');
      console.error('Error generating ID card:', error);
    } finally {
      idCardRef.current.style.display = 'none';
      setIsGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#1a1a2e',
        display: 'flex',
      }}> 
          <Lottie 
            animationData={loadingAnimation} 
            style={{ height: 300, width: 300, marginLeft:"50%", marginTop:"17%", position: 'absolute', overflow: 'hidden' }}
          />
          <p>Loading your profile...</p>
       
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="welcome-content">
          <h1>WELCOME {userData.firstName?.toUpperCase()} {userData.lastName?.toUpperCase()}</h1>
          <div className="profile-animation">
            <Lottie animationData={profileAnimation} loop={true} />
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="avatar-section">
            <div className="avatar">
              {userData.firstName?.charAt(0).toUpperCase()}{userData.lastName?.charAt(0).toUpperCase()}
            </div>
            <div className="user-meta">
              <h2>{userData.firstName} {userData.lastName}</h2>
              <span className="role-badge">{userData.role}</span>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-group">
              <h3><FiUser className="icon" /> Personal Information</h3>
              <div className="detail-row">
                <label>Full Name</label>
                {isEditing ? (
                  <div className="name-inputs">
                    <input
                      type="text"
                      name="firstName"
                      value={userData.firstName}
                      onChange={handleInputChange}
                      placeholder="First Name"
                    />
                    <input
                      type="text"
                      name="lastName"
                      value={userData.lastName}
                      onChange={handleInputChange}
                      placeholder="Last Name"
                    />
                  </div>
                ) : (
                  <p>{userData.firstName} {userData.lastName}</p>
                )}
              </div>

              <div className="detail-row">
                <label><FiMail className="icon" /> Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                  />
                ) : (
                  <p>{userData.email}</p>
                )}
              </div>

              <div className="detail-row">
                <label><FiPhone className="icon" /> Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={userData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone"
                  />
                ) : (
                  <p>{userData.phone}</p>
                )}
              </div>
            </div>

            <div className="detail-group">
              <h3><FiCreditCard className="icon" /> Additional Information</h3>
              <div className="detail-row">
                <label>NIC Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="nic"
                    value={userData.nic}
                    onChange={handleInputChange}
                    placeholder="NIC"
                  />
                ) : (
                  <p>{userData.nic}</p>
                )}
              </div>

              <div className="detail-row">
                <label><FiCalendar className="icon" /> Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dob"
                    value={userData.dob.split('T')[0]}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p>{new Date(userData.dob).toLocaleDateString()}</p>
                )}
              </div>

              <div className="detail-row">
                <label>Gender</label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={userData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p>{userData.gender}</p>
                )}
              </div>
            </div>
          </div>

          <div className="action-buttons">
            {isEditing ? (
              <button className="save-btn" onClick={handleSave}>
                <FiSave /> Save Changes
              </button>
            ) : (
              <>
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  <FiEdit /> Edit Profile
                </button>
                <button 
                  className="download-btn" 
                  onClick={downloadIDCard}
                  disabled={isGeneratingPDF}
                >
                  <FiDownload /> 
                  {isGeneratingPDF ? 'Generating...' : 'Download ID Card'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hidden ID Card for PDF generation */}
      <div id="id-card" ref={idCardRef} className="hidden-id-card">
        <div className="id-card-header">
          <h2>Jainam Hospital</h2>
          <p>Staff Identification Card</p>
        </div>
        
        <div className="id-card-body">
          <div className="id-card-avatar">
            {userData.firstName?.charAt(0).toUpperCase()}{userData.lastName?.charAt(0).toUpperCase()}
          </div>
          <div className="id-card-user-info">
            <h3>{userData.firstName} {userData.lastName}</h3>
            <p>{userData.role}</p>
          </div>
        </div>
        
        <div className="id-card-details">
          <div className="id-card-row">
            <span>Employee ID:</span>
            <span>{userData._id?.substring(0, 8).toUpperCase()}</span>
          </div>
          <div className="id-card-row">
            <span>Phone:</span>
            <span>{userData.phone}</span>
          </div>
          <div className="id-card-row">
            <span>Valid Until:</span>
            <span>
              {new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="id-card-footer">
          <p>
            This card is property of Jainam Hospital. If found, please return to the administration office.
          </p>
        </div>
        
        <div className="id-card-signature">
          <div className="signature-line"></div>
          <div className="signature-name">
            Mr.AAYUSH JAIN
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Loading Screen */
        .loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #1a1a2e;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .loading-screen p {
          margin-top: 1rem;
          color: #e9ecef;
          font-size: 1.2rem;
        }

        /* Main Container */
        .profile-container {
          background-color: #1a1a2e;
          color: #e9ecef;
          min-height: 100vh;
          padding: 2rem;
          margin-left: 270px;
          transition: margin-left 0.3s ease;
        }

        /* Profile Header */
        .profile-header {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .welcome-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
        }

        .welcome-content h1 {
          color: white;
          font-size: 2rem;
          margin-bottom: 1.5rem;
        }

        .profile-animation {
          width: 200px;
          height: 200px;
        }

        /* Profile Content */
        .profile-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Profile Card */
        .profile-card {
          background-color: #16213e;
          border-radius: 10px;
          padding: 2rem;
          border: 1px solid #2d3748;
        }

        /* Avatar Section */
        .avatar-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2rem;
        }

        .avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background-color: #4f46e5;
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }

        .user-meta h2 {
          font-size: 1.5rem;
          color: white;
          margin-bottom: 0.5rem;
          text-align: center;
        }

        .role-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background-color: #8b5cf6;
          color: white;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        /* Profile Details */
        .profile-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .detail-group {
          margin-bottom: 1.5rem;
        }

        .detail-group h3 {
          font-size: 1.1rem;
          color: #4f46e5;
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #2d3748;
          display: flex;
          align-items: center;
        }

        .detail-group h3 .icon {
          margin-right: 0.5rem;
        }

        .detail-row {
          margin-bottom: 1.5rem;
        }

        .detail-row label {
          display: block;
          font-size: 0.875rem;
          color: #adb5bd;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
        }

        .detail-row label .icon {
          margin-right: 0.5rem;
        }

        .detail-row p {
          font-size: 1rem;
          color: white;
          font-weight: 500;
        }

        .name-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        /* Form Inputs */
        input, select {
          width: 100%;
          padding: 0.75rem 1rem;
          background-color: #0f3460;
          border: 1px solid #3a4a6b;
          border-radius: 6px;
          color: white;
          font-size: 1rem;
        }

        input:focus, select:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
        }

        select {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23e9ecef' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1rem;
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #2d3748;
          justify-content: center;
        }

        button {
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .edit-btn {
          background-color: #4f46e5;
          color: white;
        }

        .edit-btn:hover {
          background-color: #4338ca;
        }

        .save-btn {
          background-color: #10b981;
          color: white;
        }

        .save-btn:hover {
          background-color: #059669;
        }

        .download-btn {
          background-color: #8b5cf6;
          color: white;
        }

        .download-btn:hover {
          background-color: #7c3aed;
        }

        .download-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Hidden ID Card */
        .hidden-id-card {
          background-color: #16213e;
          border-radius: 10px;
          padding: 1.5rem;
          width: 350px;
          border: 2px solid #4f46e5;
          display: none;
          position: fixed;
          top: -1000px;
          left: -1000px;
          color: #e9ecef;
        }

        .id-card-header {
          text-align: center;
          border-bottom: 2px solid #4f46e5;
          padding-bottom: 1rem;
          margin-bottom: 1.5rem;
        }

        .id-card-header h2 {
          color: #4f46e5;
          margin-bottom: 0.5rem;
        }

        .id-card-header p {
          color: #adb5bd;
          font-size: 0.9rem;
        }

        .id-card-body {
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .id-card-avatar {
          width: 80px;
          height: 80px;
          background-color: #4f46e5;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          font-size: 1.5rem;
          font-weight: bold;
          margin-right: 1rem;
        }

        .id-card-user-info h3 {
          margin: 0;
          color: white;
        }

        .id-card-user-info p {
          margin: 0.25rem 0 0;
          color: #adb5bd;
          font-size: 0.9rem;
        }

        .id-card-details {
          margin-bottom: 1.5rem;
        }

        .id-card-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .id-card-row span:first-child {
          color: #adb5bd;
          font-size: 0.9rem;
        }

        .id-card-row span:last-child {
          color: white;
          font-weight: 500;
        }

        .id-card-footer {
          background-color: #0f3460;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1.5rem;
        }

        .id-card-footer p {
          margin: 0;
          color: white;
          font-size: 0.8rem;
          text-align: center;
        }

        .id-card-signature {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .signature-line {
          width: 100px;
          height: 2px;
          background-color: #4f46e5;
          margin-bottom: 0.5rem;
        }

        .signature-name {
          background-color: #4f46e5;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .profile-container {
            margin-left: 0;
          }
        }

        @media (max-width: 768px) {
          .profile-container {
            padding: 1.5rem;
          }
          
          .welcome-content h1 {
            font-size: 1.5rem;
          }
          
          .profile-animation {
            width: 150px;
            height: 150px;
          }
          
          .profile-card {
            padding: 1.5rem;
          }
          
          .action-buttons {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
            .profile-container {
                padding: 1rem;
               
            }
          .profile-details {
            grid-template-columns: 1fr;
          }
          
          .name-inputs {
            grid-template-columns: 1fr;
          }
          
          .welcome-content h1 {
            font-size: 1.3rem;
             margin-top: 10px;
          }
          
          .profile-animation {
            width: 120px;
            height: 120px;
          }
          
          .avatar {
            width: 80px;
            height: 80px;
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;