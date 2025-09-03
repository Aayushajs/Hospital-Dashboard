import { API_BASE_URL } from "../api";
import { useContext, useState, useEffect } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../main";
import axios from "axios";
import Lottie from "lottie-react";
import loginAnimationData from "../../public/login aimation.json";
import { FaBuilding, FaEnvelope, FaLock } from "react-icons/fa6";
import { MdLogin } from "react-icons/md";
import { FaUserMd } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState("Admin");
  
  const { 
    isAuthenticated,
    isDoctorAuthenticated,
    setIsAuthenticated,
    setIsDoctorAuthenticated,
    setAdmin,
    setDoctor
  } = useContext(Context);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication status only once on component mount
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    } else if (isDoctorAuthenticated) {
      navigate("/DoctorDashboard", { replace: true });
    }
  }, []); // Empty dependency array to run only once

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.post(
  `${API_BASE_URL}/api/v1/user/login`,
        { email, password, confirmPassword, role },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      toast.success(data.message);
      
      if (role === "Admin") {
        setIsAuthenticated(true);
        setAdmin(data.user);
        navigate("/", { replace: true });
      } else {
        setIsDoctorAuthenticated(true);
        setDoctor(data.user);
        navigate("/DoctorDashboard", { replace: true });
      }
      
      // Reset form
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed. Please check credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if already authenticated
  if (isAuthenticated) return <Navigate to="/" />;
  if (isDoctorAuthenticated) return <Navigate to="/DocterDashboard"/>;

  // Styles (same as before)
  const accentColor = "#00CFE8";
  const primaryDark = "#1A202C"; 
  const secondaryDark = "#2D3748"; 
  const textColor = "#E2E8F0"; 
  const mutedTextColor = "#A0AEC0";

 const styles = {
    pageContainer: {
      display: "flex",
      minHeight: "100vh",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: primaryDark,
      color: textColor,
    },
    visualSection: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "3rem",
      background: `linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)`,
      color: "white",
      transition: "background 0.1s linear",
    },
    visualContent: {
      textAlign: "center",
      maxWidth: "500px",
    },
    visualTitle: {
      fontSize: "2.5rem",
      fontWeight: "bold",
      marginBottom: "1rem",
      textShadow: "0 2px 4px rgba(0,0,0,0.3)",
    },
    visualSubtitle: {
      fontSize: "1.1rem",
      opacity: 0.9,
      marginBottom: "2rem",
    },
    lottieContainer: {
        width: "100%",
        maxWidth: "370px",
        margin: "0 auto",
    },
    formSectionContainer: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
    },
    formCard: {
      width: "100%",
      maxWidth: "520px",
      backgroundColor: secondaryDark,
      padding: "3rem 2.5rem",
      borderRadius: "12px",
      boxShadow: `0 10px 30px rgba(0, 0, 0, 0.5), 0 0 0 1px ${accentColor}30`,
    },
    formHeader: {
      textAlign: "center",
      marginBottom: "2.5rem",
    },
    formIconContainer: {
        display: "inline-flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: `${accentColor}20`,
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        marginBottom: "1rem",
        border: `2px solid ${accentColor}80`
    },
    formTitle: {
      fontSize: "1.8rem",
      fontWeight: "600",
      color: textColor,
      marginBottom: "0.25rem",
    },
    formSubtitle: {
      fontSize: "0.9rem",
      color: mutedTextColor,
    },
    inputGroup: {
      marginBottom: "1.75rem",
    },
    label: {
      display: "block",
      fontSize: "0.875rem",
      fontWeight: "500",
      color: mutedTextColor,
      marginBottom: "0.5rem",
    },
    inputWrapper: {
      position: "relative",
    },
    inputIcon: {
      position: "absolute",
      top: "50%",
      left: "15px",
      transform: "translateY(-50%)",
      color: mutedTextColor,
      fontSize: "1.1rem",
    },
    input: {
      width: "100%",
      padding: "0.85rem 1rem 0.85rem 3rem",
      backgroundColor: primaryDark,
      border: `1px solid #4A5568`,
      borderRadius: "8px",
      fontSize: "0.95rem",
      color: textColor,
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      outline: "none",
    },
    inputFocus: {
        borderColor: accentColor,
        boxShadow: `0 0 0 3px ${accentColor}40`,
    },
    roleSelector: {
      display: "flex",
      gap: "1rem",
      marginBottom: "1.75rem",
    },
    roleButton: {
      flex: 1,
      padding: "0.75rem",
      backgroundColor: primaryDark,
      border: `1px solid #4A5568`,
      borderRadius: "8px",
      color: mutedTextColor,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      transition: "all 0.3s ease",
    },
    roleButtonActive: {
      backgroundColor: `${accentColor}20`,
      borderColor: accentColor,
      color: accentColor,
    },
    button: {
      width: "100%",
      padding: "0.9rem 1.5rem",
      backgroundColor: accentColor,
      color: primaryDark,
      border: "none",
      borderRadius: "8px",
      fontSize: "1rem",
      fontWeight: "bold",
      cursor: "pointer",
      transition: "background-color 0.3s ease, transform 0.1s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.75rem",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    buttonLoading: {
      backgroundColor: `${accentColor}90`,
      cursor: "not-allowed",
    },
    spinner: {
        animation: "spin 1s linear infinite",
        height: "1.25rem",
        width: "1.25rem",
        color: primaryDark,
    },
    footerText: {
      marginTop: "2.5rem",
      textAlign: "center",
      fontSize: "0.8rem",
      color: mutedTextColor,
    },
  };

  return (
    <div style={styles.pageContainer} className="login-page-container">
      {/* Visual Section */}
      <div style={styles.visualSection} className="login-visual-section">
        <div style={styles.visualContent}>
          <h1 style={styles.visualTitle}>JAINAM HOSPITAL</h1>
          <p style={styles.visualSubtitle}>
            Streamlining Excellence in Healthcare Administration. Secure, Efficient, Reliable.
          </p>
          <div style={styles.lottieContainer}>
            <Lottie animationData={loginAnimationData} loop={true} />
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div style={styles.formSectionContainer} className="login-form-section">
        <div style={styles.formCard} className="form-card">
          <div style={styles.formHeader}>
            <div style={styles.formIconContainer}>
                {role === "Admin" ? (
                  <FaBuilding style={{ fontSize: "1.8rem", color: accentColor }} />
                ) : (
                  <FaUserMd style={{ fontSize: "1.8rem", color: accentColor }} />
                )}
            </div>
            <h2 style={styles.formTitle}>
              {role === "Admin" ? "Admin Secure Access" : "Doctor Portal"}
            </h2>
            <p style={styles.formSubtitle}>
              {role === "Admin" 
                ? "Enter your credentials to manage the portal." 
                : "Access your doctor dashboard with secure credentials."}
            </p>
          </div>

          <form onSubmit={handleLogin}>
            {/* Role Selector */}
            <div style={styles.roleSelector}>
              <button
                type="button"
                style={role === "Admin" ? {...styles.roleButton, ...styles.roleButtonActive} : styles.roleButton}
                onClick={() => setRole("Admin")}
              >
                <FaBuilding /> Admin
              </button>
              <button
                type="button"
                style={role === "Doctor" ? {...styles.roleButton, ...styles.roleButtonActive} : styles.roleButton}
                onClick={() => setRole("Doctor")}
              >
                <FaUserMd /> Doctor
              </button>
            </div>

            {/* Form inputs (same as before) */}
            <div style={styles.inputGroup}>
              <label htmlFor="email" style={styles.label}>
                Email Address
              </label>
              <div style={styles.inputWrapper}>
                <FaEnvelope style={styles.inputIcon} />
                <input
                  id="email"
                  type="email"
                  placeholder={role === "Admin" ? "admin@jainam.com" : "doctor@jainam.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="password" style={styles.label}>
                Password
              </label>
              <div style={styles.inputWrapper}>
                <FaLock style={styles.inputIcon} />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="confirmPassword" style={styles.label}>
                Confirm Password
              </label>
              <div style={styles.inputWrapper}>
                <FaLock style={styles.inputIcon} />
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={isLoading ? {...styles.button, ...styles.buttonLoading} : styles.button}
            >
              {isLoading ? (
                <>
                  <svg style={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <MdLogin style={{fontSize: "1.3rem"}} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <p style={styles.footerText}>
            © {new Date().getFullYear()} Jainam Hospital Systems. <br/> Access restricted to authorized personnel.
          </p>
        </div>
      </div>

      {/* Responsive styles (same as before) */}
  <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 992px) {
          .login-page-container {
            flex-direction: column;
          }
          .login-visual-section {
            flex: 0 1 auto;
            min-height: 300px;
            padding: 2rem;
          }
          .login-visual-section .visual-title {
            font-size: 2rem;
          }
          .login-visual-section .lottie-container {
            max-width: 250px;
          }
          .login-form-section {
            flex: 1;
            padding: 1.5rem;
          }
          .form-card {
            padding: 2rem 1.5rem;
          }
        }

        /* Mobile: flatten card (no panel look) */
        @media (max-width: 768px) {
          .form-card {
            border-radius: 8px;
          }
        }
        @media (max-width: 576px) {
          .login-visual-section {
            min-height: 250px;
            padding: 1.5rem;
          }
          .login-visual-section .visual-title {
            font-size: 1.8rem;
          }
          .login-visual-section .lottie-container {
            max-width: 200px;
          }
          .form-title {
             font-size: 1.5rem;
          }
          .form-card {
            background: transparent !important;
            box-shadow: none !important;
            border: none !important;
            padding: 1.25rem 0.5rem !important;
            max-width: 100% !important;
          }
          .login-form-section { padding: 0 1rem 2rem; }
          .role-selector {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;