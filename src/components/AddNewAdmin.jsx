import { API_BASE_URL } from "../api";
import React, { useContext, useState } from "react";
import { Context } from "../main";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { FaUserShield, FaUserPlus, FaIdCard, FaPhone, FaCalendarAlt, FaLock } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { MdTransgender } from "react-icons/md";
import Lottie from "lottie-react";
import loadingAnimation from "../../public/loding.json";

const AddNewAdmin = () => {
  const { isAuthenticated } = useContext(Context);
  const navigateTo = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nic: "",
    dob: "",
    gender: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.nic.trim()) newErrors.nic = "NIC is required";
    if (!formData.dob) newErrors.dob = "Date of birth is required";
    if (!formData.gender) newErrors.gender = "Please select gender";
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.post(
  `${API_BASE_URL}/api/v1/user/admin/addnew`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      
      toast.success(response.data.message);
      navigateTo("/admin");
      
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        nic: "",
        dob: "",
        gender: "",
        password: ""
      });
      
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  if (isSubmitting) {
    return (
      <div className="loading-container">
        <Lottie 
          animationData={loadingAnimation} 
          style={{ overflow:"hidden", height: 400, width: 400, marginLeft: "10%" }}
        />
        <p>Creating admin account...</p>
        
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background-color: #1a1a2e;
            color: #e9ecef;
          }
          
          .loading-container p {
            margin-top: -5rem;
            font-size: 1.2rem;
            margin-left: 10%;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="admin-form-wrapper">
        <div className="form-header">
          <div className="header-content">
            <FaUserShield className="header-icon" />
            <h2>Add New Administrator</h2>
            <p>Fill in the details below to register a new admin</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-grid">
            {/* First Name */}
            <div className={`input-group ${errors.firstName ? 'error' : ''}`}>
              <label htmlFor="firstName">
                <FaUserPlus className="label-icon" />
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={handleChange}
              />
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>
            
            {/* Last Name */}
            <div className={`input-group ${errors.lastName ? 'error' : ''}`}>
              <label htmlFor="lastName">
                <FaUserPlus className="label-icon" />
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={handleChange}
              />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
            
            {/* Email */}
            <div className={`input-group ${errors.email ? 'error' : ''}`}>
              <label htmlFor="email">
                <IoMdMail className="label-icon" />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            
            {/* Phone */}
            <div className={`input-group ${errors.phone ? 'error' : ''}`}>
              <label htmlFor="phone">
                <FaPhone className="label-icon" />
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
            
            {/* NIC */}
            <div className={`input-group ${errors.nic ? 'error' : ''}`}>
              <label htmlFor="nic">
                <FaIdCard className="label-icon" />
                NIC Number
              </label>
              <input
                type="text"
                id="nic"
                name="nic"
                placeholder="Enter NIC number"
                value={formData.nic}
                onChange={handleChange}
              />
              {errors.nic && <span className="error-message">{errors.nic}</span>}
            </div>
            
            {/* Date of Birth */}
            <div className={`input-group ${errors.dob ? 'error' : ''}`}>
              <label htmlFor="dob">
                <FaCalendarAlt className="label-icon" />
                Date of Birth
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
              />
              {errors.dob && <span className="error-message">{errors.dob}</span>}
            </div>
            
            {/* Gender */}
            <div className={`input-group ${errors.gender ? 'error' : ''}`}>
              <label htmlFor="gender">
                <MdTransgender className="label-icon" />
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <span className="error-message">{errors.gender}</span>}
            </div>
            
            {/* Password */}
            <div className={`input-group ${errors.password ? 'error' : ''}`}>
              <label htmlFor="password">
                <FaLock className="label-icon" />
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Admin...' : 'Create Admin Account'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .dashboard-container {
          background-color: #1a1a2e;
          color: #e9ecef;
          min-height: 100vh;
          padding: 2rem;
          margin-left: 270px;
        }
        
        .admin-form-wrapper {
          max-width: 900px;
          margin: 0 auto;
          background-color: #16213e;
          border-radius: 10px;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .form-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .header-content {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .header-icon {
          font-size: 2.5rem;
          color: #4d7cfe;
          margin-bottom: 1rem;
        }
        
        .form-header h2 {
          color: white;
          margin: 0.5rem 0;
          font-size: 1.8rem;
        }
        
        .form-header p {
          color: #adb5bd;
          margin: 0;
        }
        
        .admin-form {
          display: flex;
          flex-direction: column;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .input-group {
          display: flex;
          flex-direction: column;
        }
        
        .input-group label {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
          color: #e9ecef;
          font-size: 0.95rem;
          font-weight: 500;
        }
        
        .label-icon {
          margin-right: 0.5rem;
          color: #4d7cfe;
          font-size: 1rem;
        }
        
        .input-group input,
        .input-group select {
          padding: 0.75rem 1rem;
          border-radius: 6px;
          border: 1px solid #3a4a6b;
          background-color: #0f3460;
          color: white;
          font-size: 0.95rem;
          transition: border-color 0.3s ease;
        }
        
        .input-group input:focus,
        .input-group select:focus {
          outline: none;
          border-color: #4d7cfe;
          box-shadow: 0 0 0 2px rgba(77, 124, 254, 0.2);
        }
        
        .input-group.error input,
        .input-group.error select {
          border-color: #ff6b6b;
        }
        
        .error-message {
          color: #ff6b6b;
          font-size: 0.8rem;
          margin-top: 0.25rem;
        }
        
        .form-actions {
          display: flex;
          justify-content: center;
          margin-top: 1.5rem;
        }
        
        .submit-btn {
          background-color: #4d7cfe;
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        
        .submit-btn:hover {
          background-color: #3a6aed;
        }
        
        .submit-btn:disabled {
          background-color: #3a4a6b;
          cursor: not-allowed;
        }
        
        /* Responsive Adjustments */
        @media (max-width: 1200px) {
          .dashboard-container {
            margin-left: 0;
          }
        }
        
        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1.5rem;
          }
          
          .admin-form-wrapper {
            padding: 1.5rem;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 480px) {
          .dashboard-container {
            padding: 1rem;
          }
          
          .admin-form-wrapper {
            padding: 1rem;
          }
          
          .form-header h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AddNewAdmin;