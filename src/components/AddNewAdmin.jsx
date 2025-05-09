import React, { useContext, useState } from "react";
import { Context } from "../main";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { FaUserShield, FaUserPlus, FaIdCard, FaPhone, FaCalendarAlt, FaLock } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { MdTransgender } from "react-icons/md";

const AddNewAdmin = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);
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
    
    // Clear error when user types
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
        //"http://localhost:4000/api/v1/user/admin/addnew",
        "https://jainam-hospital-backend.onrender.com/api/v1/user/admin/addnew",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      
      toast.success(response.data.message);
      setIsAuthenticated(true);
      navigateTo("/");
      
      // Reset form
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

  return (
    <div className="admin-form-container">
      <div className="admin-form-card">
        <div className="form-header">
          <FaUserShield className="header-icon" />
          <img src="https://thumbs.dreamstime.com/b/modern-minimalist-design-featuring-clean-lines-bold-shapes-logo-vector-based-graphic-striking-silhouette-352078871.jpg" alt="logo" className="logo"/>
          <h1>Add New Administrator</h1>
          <p>Fill in the details below to register a new admin</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className={`input-group ${errors.firstName ? 'error' : ''}`}>
              <label htmlFor="firstName">First Name</label>
              <div className="input-wrapper">
                <FaUserPlus className="input-icon" />
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>
            
            <div className={`input-group ${errors.lastName ? 'error' : ''}`}>
              <label htmlFor="lastName">Last Name</label>
              <div className="input-wrapper">
                <FaUserPlus className="input-icon" />
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
            
            <div className={`input-group ${errors.email ? 'error' : ''}`}>
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <IoMdMail className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            
            <div className={`input-group ${errors.phone ? 'error' : ''}`}>
              <label htmlFor="phone">Phone Number</label>
              <div className="input-wrapper">
                <FaPhone className="input-icon" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
            
            <div className={`input-group ${errors.nic ? 'error' : ''}`}>
              <label htmlFor="nic">NIC Number</label>
              <div className="input-wrapper">
                <FaIdCard className="input-icon" />
                <input
                  type="text"
                  id="nic"
                  name="nic"
                  placeholder="Enter NIC number"
                  value={formData.nic}
                  onChange={handleChange}
                />
              </div>
              {errors.nic && <span className="error-message">{errors.nic}</span>}
            </div>
            
            <div className={`input-group ${errors.dob ? 'error' : ''}`}>
              <label htmlFor="dob">Date of Birth</label>
              <div className="input-wrapper">
                <FaCalendarAlt className="input-icon" />
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                />
              </div>
              {errors.dob && <span className="error-message">{errors.dob}</span>}
            </div>
            
            <div className={`input-group ${errors.gender ? 'error' : ''}`}>
              <label htmlFor="gender">Gender</label>
              <div className="input-wrapper">
                <MdTransgender className="input-icon" />
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
              </div>
              {errors.gender && <span className="error-message">{errors.gender}</span>}
            </div>
            
            <div className={`input-group ${errors.password ? 'error' : ''}`}>
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
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
    </div>
  );
};

export default AddNewAdmin;