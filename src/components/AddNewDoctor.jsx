import React, { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../main";
import axios from "axios";
import { FaUserMd, FaUserPlus, FaIdCard, FaPhone, FaCalendarAlt, FaLock, FaClinicMedical } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { MdTransgender, MdPhotoCamera } from "react-icons/md";
import Lottie from "lottie-react";
import loadingAnimation from "../../public/loding.json";

const AddNewDoctor = () => {
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
    password: "",
    doctorDepartment: ""
  });

  const [docAvatar, setDocAvatar] = useState(null);
  const [docAvatarPreview, setDocAvatarPreview] = useState("/docHolder.jpg");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departmentsArray = [
    "Pediatrics",
    "Orthopedics",
    "Cardiology",
    "Neurology",
    "Oncology",
    "Radiology",
    "Physical Therapy",
    "Dermatology",
    "ENT",
  ];

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setDocAvatar(file);
    }
  };

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
    if (!formData.doctorDepartment) newErrors.doctorDepartment = "Department is required";
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!docAvatar) newErrors.avatar = "Doctor photo is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("firstName", formData.firstName);
      formDataToSend.append("lastName", formData.lastName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("nic", formData.nic);
      formDataToSend.append("dob", formData.dob);
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("doctorDepartment", formData.doctorDepartment);
      formDataToSend.append("docAvatar", docAvatar);

      const response = await axios.post(
        "https://jainam-hospital-backend.onrender.com/api/v1/user/doctor/addnew",
        formDataToSend,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      
      toast.success(response.data.message);
      navigateTo("/doctor");
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        nic: "",
        dob: "",
        gender: "",
        password: "",
        doctorDepartment: ""
      });
      setDocAvatar(null);
      setDocAvatarPreview("");
      
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
        <p>Registering doctor...</p>
        
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
      <div className="doctor-form-wrapper">
        <div className="form-header">
          <div className="header-content">
            <FaUserMd className="header-icon" />
            <h2>Register New Doctor</h2>
            <p>Fill in the details to add a new doctor to the system</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="doctor-form">
          <div className="form-content">
            <div className="avatar-section">
              <div className={`avatar-upload ${errors.avatar ? 'error' : ''}`}>
                <div className="avatar-preview">
                  <img src={docAvatarPreview} alt="Doctor Preview" />
                  <div className="upload-overlay">
                    <MdPhotoCamera className="camera-icon" />
                    <span>Upload Photo</span>
                  </div>
                  <input 
                    type="file" 
                    onChange={handleAvatar}
                    accept="image/*"
                    className="file-input"
                  />
                </div>
                {errors.avatar && <span className="error-message">{errors.avatar}</span>}
              </div>
            </div>
            
            <div className="form-fields">
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
                
                {/* Department */}
                <div className={`input-group ${errors.doctorDepartment ? 'error' : ''}`}>
                  <label htmlFor="doctorDepartment">
                    <FaClinicMedical className="label-icon" />
                    Department
                  </label>
                  <select
                    id="doctorDepartment"
                    name="doctorDepartment"
                    value={formData.doctorDepartment}
                    onChange={handleChange}
                  >
                    <option value="">Select Department</option>
                    {departmentsArray.map((department, index) => (
                      <option key={index} value={department}>{department}</option>
                    ))}
                  </select>
                  {errors.doctorDepartment && <span className="error-message">{errors.doctorDepartment}</span>}
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
                  {isSubmitting ? 'Registering Doctor...' : 'Register Doctor'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        .dashboard-container {
          background-color: #1a1a2e;
          color: #e9ecef;
          min-height: 100vh;
          padding: 1rem;
          margin-left: 270px;
        }
        
        .doctor-form-wrapper {
          max-width: 1000px;
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
        
        .doctor-form {
          display: flex;
          flex-direction: column;
        }
        
        .form-content {
          display: flex;
          gap: 2rem;
        }
        
        .avatar-section {
          flex: 0 0 250px;
        }
        
        .avatar-upload {
          position: relative;
          margin-bottom: 1rem;
        }
        
        .avatar-preview {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #3a4a6b;
          position: relative;
          cursor: pointer;
        }
        
        .avatar-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .upload-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .avatar-preview:hover .upload-overlay {
          opacity: 1;
        }
        
        .camera-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        
        .file-input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }
        
        .form-fields {
          flex: 1;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .input-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 1rem;
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
        .input-group.error select,
        .avatar-upload.error .avatar-preview {
          border-color: #ff6b6b;
        }
        
        .error-message {
          color: #ff6b6b;
          font-size: 0.8rem;
          margin-top: 0.25rem;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
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
        
        @media (max-width: 900px) {
          .form-content {
            flex-direction: column;
            align-items: center;
          }
          
          .avatar-section {
            margin-bottom: 2rem;
          }
        }
        
        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1.5rem;
          }
          
          .doctor-form-wrapper {
            padding: 1.5rem;
          }
        }
        
        @media (max-width: 480px) {
          .dashboard-container {
            padding: 1rem;
          }
          
          .doctor-form-wrapper {
            padding: 1rem;
          }
          
          .form-header h2 {
            font-size: 1.5rem;
          }
          
          .avatar-preview {
            width: 150px;
            height: 150px;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AddNewDoctor;