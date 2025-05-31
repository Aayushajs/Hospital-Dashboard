import React, { useContext, useState, useEffect } from "react";
import { TiHome } from "react-icons/ti";
import { RiLogoutBoxFill } from "react-icons/ri";
import { AiFillMessage, AiOutlineSearch } from "react-icons/ai";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaUserDoctor } from "react-icons/fa6";
import { MdAddModerator } from "react-icons/md";
import { IoPersonAddSharp } from "react-icons/io5";
import { FiChevronRight } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";
import { useNavigate, useLocation } from "react-router-dom";
import Lottie from "lottie-react";
import animationData from "../../public/notfountAnimation.json"

const Sidebar = () => {
  const [show, setShow] = useState(false);
  const [activeLink, setActiveLink] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { isAuthenticated, setIsAuthenticated, admin } = useContext(Context);
  const navigateTo = useNavigate();
  const location = useLocation();

  // Check if mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShow(true);
      } else {
        setShow(false);
      }
    };

    window.addEventListener("resize", handleResize);
    
    // Set loading to false after 1 second
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

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
  }, [location]);

  const handleLogout = async () => {
    try {
      const { data } = await axios.get(
        "https://jainam-hospital-backend.onrender.com/api/v1/user/admin/logout",
        { withCredentials: true }
      );
      toast.success(data.message);
      setIsAuthenticated(false);
      navigateTo("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Logout failed");
    }
  };

  const navigate = (path) => {
    navigateTo(path);
    if (isMobile) setShow(false);
  };

  const navItems = [
    { icon: <TiHome />, label: "Dashboard", path: "/", key: "dashboard" },
    {icon: <FaUserDoctor />, label: "My Profile", path: "/admin/profile", key: "profile" },
    { icon: <FaUserDoctor />, label: "Doctors", path: "/doctors", key: "doctors" },
    {icon: <IoPersonAddSharp />, label: "Patients", path: "/PatientsDashboard", key: "PatientsDashboard" },
    { icon: <MdAddModerator />, label: "Add Admin", path: "/admin/addnew", key: "addAdmin" },
    { icon: <IoPersonAddSharp />, label: "Add Doctor", path: "/doctor/addnew", key: "addDoctor" },
    { icon: <AiFillMessage />, label: "Feedback Messages", path: "/messages", key: "messages" },
  ];

  // Filter nav items based on search term
  const filteredNavItems = navItems.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="sidebar-skeleton">
        <div className="skeleton-header">
          <div className="skeleton-logo"></div>
          <div className="skeleton-company">
            <div className="skeleton-text" style={{ width: '120px', height: '20px' }}></div>
            <div className="skeleton-text" style={{ width: '80px', height: '16px', marginTop: '8px' }}></div>
          </div>
        </div>
        
        <div className="skeleton-search">
          <div className="skeleton-search-icon"></div>
          <div className="skeleton-search-input"></div>
        </div>
        
        <div className="skeleton-nav">
          {[1, 2, 3, 4, 5,6,7].map((item) => (
            <div key={item} className="skeleton-nav-item">
              <div className="skeleton-icon"></div>
              <div className="skeleton-text" style={{ width: '70%', height: '16px' }}></div>
            </div>
          ))}
        </div>
        
        <div className="skeleton-logout">
          <div className="skeleton-icon"></div>
          <div className="skeleton-text" style={{ width: '70%', height: '16px' }}></div>
        </div>

        <style jsx>{`
          .sidebar-skeleton {
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

          .skeleton-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 2rem;
          }

          .skeleton-logo {
            width: 50px;
            height: 50px;
            border-radius: 8px;
            background: linear-gradient(90deg, #2d3748 25%, #1a202c 50%, #2d3748 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }

          .skeleton-company {
            flex: 1;
          }

          .skeleton-text {
            background: linear-gradient(90deg, #2d3748 25%, #1a202c 50%, #2d3748 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
          }

          .skeleton-search {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 2rem;
            padding: 0.5rem;
            background-color: #0f3460;
            border-radius: 6px;
          }

          .skeleton-search-icon {
            width: 20px;
            height: 20px;
            background: linear-gradient(90deg, #2d3748 25%, #1a202c 50%, #2d3748 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 50%;
          }

          .skeleton-search-input {
            flex: 1;
            height: 20px;
            background: linear-gradient(90deg, #2d3748 25%, #1a202c 50%, #2d3748 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
          }

          .skeleton-nav {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .skeleton-nav-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.8rem;
          }

          .skeleton-icon {
            width: 24px;
            height: 24px;
            background: linear-gradient(90deg, #2d3748 25%, #1a202c 50%, #2d3748 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
          }

          .skeleton-logout {
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
            .sidebar-skeleton {
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
      {show && isMobile && (
        <div 
          className="sidebar-overlay"
          onClick={() => setShow(false)}
        />
      )}

      {/* Sidebar */}
      <nav className={`sidebar ${show ? "show" : ""}`}>
        <div className="sidebar-header">
          <div className="company-brand">
            <img 
              src="https://t4.ftcdn.net/jpg/08/44/82/55/360_F_844825587_MEoU8odal1uKKTjNOoFa0A4yLyZzJ0gG.jpg" // Replace with your hospital logo
              alt="Hospital Logo" 
              className="company-logo"
            />
            <div className="company-info">
              <h4 className="company-name">Jainam Hospital</h4>
              <p className="company-tagline">Quality Healthcare</p>
            </div>
          </div>
          <button 
            className="close-btn"
            onClick={() => setShow(false)}
            aria-label="Close sidebar"
          >
            &times;
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <AiOutlineSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search menu..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="nav-links">
          {filteredNavItems.length > 0 ? (
            filteredNavItems.map((item) => (
              <div
                key={item.key}
                className={`nav-item ${activeLink === item.key ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <div className="nav-icon">{item.icon}</div>
                <span className="nav-label">{item.label}</span>
                <FiChevronRight className="nav-chevron" />
              </div>
            ))
          ) : (
             <tr>
                              <td colSpan="10" className="no-data">
                                <div className="empty-state">
                                  <Lottie 
                                    animationData={animationData} 
                                    style={{ height: 200, width: 200, overflow: 'hidden' }} 
                                  />
                                  <p>Nofound</p>
                                </div>
                              </td>
                            </tr>
          )}
        </div>

        <div className="logout-section">
          <div 
            className="nav-item logout"
            onClick={handleLogout}
          >
            <div className="nav-icon">
              <RiLogoutBoxFill />
            </div>
            <span className="nav-label">Log Out</span>
          </div>
        </div>
      </nav>

      {/* Hamburger menu */}
      <button 
        className="hamburger-menu"
        onClick={() => setShow(!show)}
        aria-label="Toggle sidebar"
      >
        <GiHamburgerMenu />
      </button>

      <style jsx>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 280px;
          height: 100vh;
          background-color: #16213e;
          color: #e9ecef;
          z-index: 1000;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
          display: flex;
          flex-direction: column;
          box-shadow: 5px 0 15px rgba(0, 0, 0, 0.1);
          border-right: 1px solid #2d3748;
        }

        .sidebar.show {
          transform: translateX(0);
        }

        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }

        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid #2d3748;
          position: relative;
        }

        .company-brand {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .company-logo {
          width: 50px;
          height: 50px;
          border-radius: 50px;
          object-fit: cover;
        }

        .company-info {
          flex: 1;
        }

        .company-name {
          margin: 0;
          font-size: 1.1rem;
          color: white;
          font-weight: 600;
        }

        .company-tagline {
          margin: 0.2rem 0 0;
          font-size: 0.8rem;
          color: #adb5bd;
        }

.search-container {
  position: relative;
   margin-left: -0.65rem;
  padding: 0.5rem 1.2rem;
}

.search-icon {
  position: absolute;
  left: 30px;
  top: 50%;
  transform: translateY(-50%);
  color: #adb5bd;
  font-size: 1.5rem;
  transition: color 0.3s ease;
}

.search-input {
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

.search-input:hover {
  border-color: #3d4b64;
  background-color: #0d2b57;
}

.search-input:focus {
  outline: none;
  border-color: #0d6efd;
  background-color: #0a2247;
  box-shadow: 
    0 0 0 3px rgba(13, 110, 253, 0.25),
    inset 0 1px 2px rgba(0, 0, 0, 0.2);
}

.search-input::placeholder {
  color: #6c757d;
  opacity: 1;
  font-weight: 400;
  letter-spacing: 0.2px;
}

/* For dark mode compatibility */
@media (prefers-color-scheme: dark) {
  .search-input {
    background-color: #0a2247;
    border-color: #36445c;
  }
  
  .search-input:hover {
    background-color: #081d3d;
    border-color: #435572;
  }
  
  .search-icon {
    color: #8e9aaf;
  }
}

        .close-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          color: #adb5bd;
          font-size: 1.5rem;
          cursor: pointer;
          display: none;
        }

        .nav-links {
          flex: 1;
          padding: 1rem 0;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 0.8rem 1.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .nav-item:hover {
          background-color: #0f3460;
        }

        .nav-item.active {
          background-color: #0d6efd;
        }

        .nav-item.active .nav-icon {
          color: white;
        }

        .nav-item.active .nav-label {
          color: white;
          font-weight: 500;
        }

        .nav-item.active .nav-chevron {
          opacity: 1;
          transform: translateX(0);
        }

        .nav-icon {
          font-size: 1.2rem;
          margin-right: 1rem;
          color: #adb5bd;
          transition: color 0.2s ease;
        }

        .nav-label {
          flex: 1;
          font-size: 0.9rem;
          color: #e9ecef;
          transition: color 0.2s ease;
        }

        .nav-chevron {
          font-size: 0.9rem;
          opacity: 0;
          transform: translateX(-5px);
          transition: all 0.2s ease;
        }

        .no-results {
          padding: 1rem 1.5rem;
          color: #6c757d;
          font-size: 0.9rem;
          text-align: center;
        }

        .logout-section {
          padding: 1rem 0;
          border-top: 1px solid #2d3748;
        }

        .logout-section .nav-item {
          color: #dc3545;
        }

        .logout-section .nav-icon {
          color: #dc3545;
        }

        .logout-section .nav-item:hover {
          background-color: rgba(220, 53, 69, 0.1);
        }

        .hamburger-menu {
          position: fixed;
          top: 1rem;
          left: 1rem;
          background-color: #16213e;
          color: white;
          border: none;
          border-radius: 5px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          cursor: pointer;
          z-index: 100;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
        }

        .hamburger-menu:hover {
          background-color: #0f3460;
          transform: scale(1.05);
        }

        @media (max-width: 768px) {
          .close-btn {
            display: block;
          }
        }

        @media (min-width: 769px) {
          .sidebar {
            transform: translateX(0);
          }
          
          .hamburger-menu {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .sidebar {
            width: 250px;
          }
          
          .company-brand {
            flex-direction: row;
            justify-content: flex-start;
            align-items: flex-start;
          }
          
          .company-logo {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;