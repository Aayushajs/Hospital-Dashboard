import { API_BASE_URL } from "../api";
import { useContext, useState, useEffect, useRef } from "react";
import { TiHome } from "react-icons/ti";
import { RiLogoutBoxFill } from "react-icons/ri";
import { AiFillMessage, AiOutlineSearch } from "react-icons/ai";
import { GiHamburgerMenu } from "react-icons/gi";
import {  FaUserInjured, FaNotesMedical } from "react-icons/fa";
import { FaUserDoctor } from "react-icons/fa6";
import { MdAddModerator, MdMedicalServices } from "react-icons/md";
import { IoPersonAddSharp } from "react-icons/io5";
import { FiChevronRight } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";
import { useNavigate, useLocation } from "react-router-dom";
import Lottie from "lottie-react";
import animationData from "../../public/notfountAnimation.json";

const Sidebar = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeLink, setActiveLink] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { 
    isAuthenticated, 
    isDoctorAuthenticated,
    setIsAuthenticated,
    setIsDoctorAuthenticated,
    admin,
    doctor
  } = useContext(Context);
  
  const navigateTo = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const sidebarRef = useRef(null);

  // Check if mobile view
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowSidebar(true);
      } else {
        setShowSidebar(false);
      }
    };

    window.addEventListener("resize", handleResize);
    
    // Set loading to false after 1 second
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    const handleClickOutside = (event) => {
      if (isMobile && 
          showSidebar && 
          sidebarRef.current && 
          !sidebarRef.current.contains(event.target) &&
          !event.target.closest('.menu-toggle')) {
        setShowSidebar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, showSidebar]);
  

  // Set active link based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === "/") setActiveLink("dashboard");
    else if (path === "/doctors") setActiveLink("doctors");
    else if (path === "/messages") setActiveLink("messages");
    else if (path === "/doctor/addnew") setActiveLink("addDoctor");
    else if (path === "/admin/addnew") setActiveLink("addAdmin");
    else if (path === "/PatientsDashboard") setActiveLink("PatientsDashboard");
    else if (path === "/admin/profile") setActiveLink("profile");
    else if (path === "/ChatRoom") setActiveLink("ChatRoom");
    else if (path === "/description/:id") setActiveLink("description/:id");
    else if (path === "/DoctorDashboard") setActiveLink("DoctorDashboard");
    else if (path === "/doctor/patients") setActiveLink("doctorPatients");
    else if (path === "/doctor/messages") setActiveLink("doctorMessages");
    else if (path === "/doctor/medical-records") setActiveLink("medicalRecords");
    else setActiveLink("");
  }, [location]);

  const handleLogout = async () => {
    try {
      let endpoint = "";
      if (isAuthenticated) {
  endpoint = `${API_BASE_URL}/api/v1/user/admin/logout`;
      } else if (isDoctorAuthenticated) {
  endpoint = `${API_BASE_URL}/api/v1/user/doctor/logout`;
      }
      
      const { data } = await axios.get(endpoint, { withCredentials: true });
      toast.success(data.message);
      setIsAuthenticated(false);
      setIsDoctorAuthenticated(false);
      navigateTo("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Logout failed");
    }
  };

  const navigate = (path) => {
    navigateTo(path);
    if (isMobile) setShowSidebar(false);
  };

  // Admin nav items
  const adminNavItems = [
    { icon: <TiHome />, label: "Dashboard", path: "/", key: "dashboard" },
    { icon: <FaUserDoctor />, label: "My Profile", path: "/admin/profile", key: "profile" },
    { icon: <FaUserDoctor />, label: "Doctors", path: "/doctors", key: "doctors" },
    { icon: <IoPersonAddSharp />, label: "Patients", path: "/PatientsDashboard", key: "PatientsDashboard" },
    { icon: <MdAddModerator />, label: "Add Admin", path: "/admin/addnew", key: "addAdmin" },
    { icon: <IoPersonAddSharp />, label: "Add Doctor", path: "/doctor/addnew", key: "addDoctor" },
    { icon: <GiHamburgerMenu />, label: "Chat Room", path: "/ChatRoom", key: "ChatRoom" },
    { icon: <AiFillMessage />, label: "Feedback Messages", path: "/messages", key: "messages" },
    { icon: <AiOutlineSearch />, label: "Medical Descriptions", path: "/description/:id", key: "description" }
  ];

  // Doctor nav items
  const doctorNavItems = [
    { icon: <TiHome />, label: "Dashboard", path: "/DoctorDashboard", key: "DoctorDashboard" },
    { icon: <FaUserDoctor />, label: "My Profile", path: "/doctor/profile", key: "doctorProfile" },
    { icon: <FaUserInjured />, label: "My Patients", path: "/doctor/patients", key: "doctorPatients" },
    { icon: <AiFillMessage />, label: "Messages", path: "/doctor/messages", key: "doctorMessages" },
    { icon: <FaNotesMedical />, label: "Medical Records", path: "/doctor/medical-records", key: "medicalRecords" },
    { icon: <MdMedicalServices />, label: "Prescriptions", path: "/doctor/prescriptions", key: "prescriptions" }
  ];

  // Get appropriate nav items based on user type
  const navItems = isAuthenticated ? adminNavItems : isDoctorAuthenticated ? doctorNavItems : [];
  
  // Filter nav items based on search term
  const filteredNavItems = navItems.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Focus search input when sidebar opens
  useEffect(() => {
    if (showSidebar && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 300);
    }
  }, [showSidebar]);

  const handleSearchClick = (e) => {
    e.stopPropagation();
  };

  const toggleSidebar = () => {
    setShowSidebar(prev => {
      if (!prev && isMobile) {
        setSearchTerm("");
      }
      return !prev;
    });
  };

  if (!isAuthenticated && !isDoctorAuthenticated) return null;

  if (loading) {
    return (
      <div className="sidebar-loading">
        <div className="loading-header">
          <div className="loading-logo"></div>
          <div className="loading-company">
            <div className="loading-text" style={{ width: '120px', height: '20px' }}></div>
            <div className="loading-text" style={{ width: '80px', height: '16px', marginTop: '8px' }}></div>
          </div>
        </div>
        
        <div className="loading-search">
          <div className="loading-search-icon"></div>
          <div className="loading-search-input"></div>
        </div>
        
        <div className="loading-nav">
          {[1, 2, 3, 4, 5,6,7,8,9].map((item) => (
            <div key={item} className="loading-nav-item">
              <div className="loading-icon"></div>
              <div className="loading-text" style={{ width: '70%', height: '16px' }}></div>
            </div>
          ))}
        </div>
        
        <div className="loading-logout">
          <div className="loading-icon"></div>
          <div className="loading-text" style={{ width: '70%', height: '16px' }}></div>
        </div>

        <style jsx="true">{`
          .sidebar-loading {
            position: fixed;
            top: 0;
            left: 0;
            width: 280px;
            height: 100vh;
            background-color: #16213e;
            z-index: 1000;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
          }

          .loading-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 2rem;
          }

          .loading-logo {
            width: 50px;
            height: 50px;
            border-radius: 8px;
            background: linear-gradient(90deg, #2d3748 25%, #1a202c 50%, #2d3748 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }

          .loading-company {
            flex: 1;
          }

          .loading-text {
            background: linear-gradient(90deg, #2d3748 25%, #1a202c 50%, #2d3748 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
          }

          .loading-search {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 2rem;
            padding: 0.5rem;
            background-color: #0f3460;
            border-radius: 6px;
          }

          .loading-search-icon {
            width: 20px;
            height: 20px;
            background: linear-gradient(90deg, #2d3748 25%, #1a202c 50%, #2d3748 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 50%;
          }

          .loading-search-input {
            flex: 1;
            height: 20px;
            background: linear-gradient(90deg, #2d3748 25%, #1a202c 50%, #2d3748 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
          }

          .loading-nav {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .loading-nav-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.8rem;
          }

          .loading-icon {
            width: 24px;
            height: 24px;
            background: linear-gradient(90deg, #2d3748 25%, #1a202c 50%, #2d3748 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
          }

          .loading-logout {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.8rem;
            margin-top: auto;
          }

          @keyframes shimmer {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }

          @media (max-width: 768px) {
            .sidebar-loading {
              width: 250px;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {/* Overlay for mobile when sidebar is open */}
      {showSidebar && isMobile && (
        <div 
          className="sidebar-overlay"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <nav className={`sidebar-container ${showSidebar ? "show" : ""}`}
        ref={sidebarRef}>
        <div className="sidebar-header">
          <div className="brand-container">
            <img 
              src="https://t4.ftcdn.net/jpg/08/44/82/55/360_F_844825587_MEoU8odal1uKKTjNOoFa0A4yLyZzJ0gG.jpg"
              alt="Hospital Logo" 
              className="brand-logo"
            />
            <div className="brand-info">
              <h4 className="brand-name">Jainam Hospital</h4>
              <p className="brand-tagline">Quality Healthcare</p>
            </div>
          </div>
          <button 
            className="close-button"
            onClick={() => setShowSidebar(false)}
            aria-label="Close sidebar"
          >
            &times;
          </button>
        </div>

        {/* Search Bar */}
       {!isMobile && (
  <div className="search-wrapper" onClick={handleSearchClick}>
    <AiOutlineSearch className="search-icon" />
    <input
      type="text"
      placeholder="Search menu..."
      className="search-field"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      ref={searchInputRef}
    />
  </div>
)}

        <div className="navigation-links">
          {filteredNavItems.length > 0 ? (
            filteredNavItems.map((item) => (
              <div
                key={item.key}
                className={`nav-link ${activeLink === item.key ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <div className="link-icon">{item.icon}</div>
                <span className="link-text">{item.label}</span>
                <FiChevronRight className="link-arrow" />
              </div>
            ))
          ) : (
            <div className="no-results">
              <Lottie 
                animationData={animationData} 
                style={{ height: 200, width: 200, overflow: 'hidden' }} 
              />
              <p>No results found</p>
            </div>
          )}
        </div>

        <div className="logout-container">
          <div 
            className="nav-link logout"
            onClick={handleLogout}
          >
            <div className="link-icon">
              <RiLogoutBoxFill />
            </div>
            <span className="link-text">Log Out</span>
          </div>
        </div>
      </nav>

      {/* Hamburger menu */}
       <button 
        className="menu-toggle"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <GiHamburgerMenu />
      </button>

      <style jsx="true">{`

        .brand-info {
          flex: 1;
        }
        
        .user-name {
          margin: 0.2rem 0 0;
          font-size: 0.85rem;
          color: #4d7cfe;
          font-weight: 500;
        }
           .sidebar-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 280px;
          height: 100vh;
          background-color: #16213e;
          color: #e9ecef;
          z-index: 1001; /* Higher than overlay */
          transform: translateX(-100%);
          transition: transform 0.3s ease;
          display: flex;
          flex-direction: column;
          box-shadow: 5px 0 15px rgba(0, 0, 0, 0.1);
          border-right: 1px solid #2d3748;
        }

        .sidebar-container.show {
          transform: translateX(0);
        }

        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1000; /* Below sidebar */
        }

        .menu-toggle {
          position: fixed;
          top: 1rem;
          left: 1rem;
          background-color: #4d7cfe;
          color: white;
          border: none;
          border-radius: 5px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          cursor: pointer;
          z-index: 1002; /* Above everything */
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
        }

        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid #2d3748;
          position: relative;
          display: flex;
          align-items: center;
        }

        .brand-container {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }

        .brand-logo {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #4d7cfe;
        }

        .brand-info {
          flex: 1;
        }

        .brand-name {
          margin: 0;
          font-size: 1.1rem;
          color: white;
          font-weight: 600;
        }

        .brand-tagline {
          margin: 0.2rem 0 0;
          font-size: 0.8rem;
          color: #adb5bd;
        }

        .close-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          color: #adb5bd;
          font-size: 1.5rem;
          cursor: pointer;
          display: none;
          transition: color 0.2s ease;
        }

        .close-button:hover {
          color: white;
        }

        .search-wrapper {
          position: relative;
          margin: 1rem;
          margin-bottom: 1.5rem;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #4d7cfe;
          font-size: 1.2rem;
          transition: color 0.3s ease;
        }

        .search-field {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          background-color: #0f3460;
          border: 2px solid #2d3748;
          border-radius: 8px;
          color: #f8f9fa;
          font-size: 0.95rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .search-field:hover {
          border-color: #3d4b64;
          background-color: #0d2b57;
        }

        .search-field:focus {
          outline: none;
          border-color: #4d7cfe;
          background-color: #0a2247;
          box-shadow: 
            0 0 0 3px rgba(77, 124, 254, 0.25),
            inset 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .search-field::placeholder {
          color: #6c757d;
          opacity: 1;
          font-weight: 400;
          letter-spacing: 0.2px;
        }

        .navigation-links {
          flex: 1;
          padding: 0.5rem 0;
          overflow-y: hidden;
        }

        .nav-link {
          display: flex;
          align-items: center;
          padding: 0.9rem 1.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          margin: 0.25rem 0;
        }

        .nav-link:hover {
          background-color: #0f3460;
        }

        .nav-link.active {
          background-color: #4d7cfe;
        }

        .nav-link.active .link-icon {
          color: white;
        }

        .nav-link.active .link-text {
          color: white;
          font-weight: 500;
        }

        .nav-link.active .link-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        .link-icon {
          font-size: 1.3rem;
          margin-right: 1rem;
          color: #7f8c8d;
          transition: color 0.2s ease;
          min-width: 24px;
          display: flex;
          justify-content: center;
        }

        .nav-link:hover .link-icon,
        .nav-link.active .link-icon {
          color: white;
        }

        .link-text {
          flex: 1;
          font-size: 0.95rem;
          color: #e9ecef;
          transition: color 0.2s ease;
        }

        .link-arrow {
          font-size: 0.9rem;
          opacity: 0;
          transform: translateX(-5px);
          transition: all 0.2s ease;
          color: rgba(255, 255, 255, 0.7);
        }

        .nav-link:hover .link-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        .no-results {
          padding: 2rem 1.5rem;
          color: #6c757d;
          font-size: 0.9rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .no-results p {
          margin-top: 1rem;
          color: #adb5bd;
          font-size: 1rem;
        }

        .logout-container {
          padding: 0.5rem 0;
          border-top: 1px solid #2d3748;
          margin-top: auto;
        }

        .logout-container .nav-link {
          color: #ff6b6b;
        }

        .logout-container .link-icon {
          color: #ff6b6b;
        }

        .logout-container .nav-link:hover {
          background-color: rgba(220, 53, 69, 0.1);
        }
        .menu-toggle {
          position: fixed;
          top: 1rem;
          left: 1rem;
          background-color: #4d7cfe;
          color: white;
          border: none;
          border-radius: 5px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          cursor: pointer;
          z-index: 100;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
        }

        .menu-toggle:hover {
          background-color: #3a6aed;
          transform: scale(1.05);
        }

        @media (max-width: 768px) {
          .close-button {
            display: block;
          }
          .mobile-search {
    display: none !important;
  }
    .navigation-links {
    padding-top: 0.5rem;
  }
          .sidebar-container {
            width: 260px;
          }
        }

        @media (min-width: 769px) {
          .sidebar-container {
            transform: translateX(0);
          }
          
          .menu-toggle {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .brand-container {
            flex-direction: row;
          }
          
          .brand-logo {
            width: 45px;
            height: 45px;
          }
          
          .brand-name {
            font-size: 1rem;
          }
          
          .brand-tagline {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;