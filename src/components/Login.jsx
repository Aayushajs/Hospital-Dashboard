import  { useContext, useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../main"; // Assuming this path is correct
import axios from "axios";
import Lottie from "lottie-react";
import loginAnimationData from "../../public/login aimation.json"; // Your existing animation
import { FaEnvelope, FaLock, FaBuilding } from "react-icons/fa";
import { MdLogin } from "react-icons/md";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);
  const navigateTo = useNavigate();

  // For dynamic gradient animation effect
  const [gradientAngle, setGradientAngle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGradientAngle((prevAngle) => (prevAngle + 1) % 360);
    }, 50); // Adjust speed of gradient animation
    return () => clearInterval(interval);
  }, []);


  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.post(
        "https://jainam-hospital-backend.onrender.com/api/v1/user/login",
        { 
          email, 
          password, 
          confirmPassword, 
          role: "Admin" 
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success(data.message);
      setIsAuthenticated(true);
      navigateTo("/");
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

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  const accentColor = "#00CFE8"; // A vibrant cyan/teal accent
  const primaryDark = "#1A202C"; // Very dark (almost black)
  const secondaryDark = "#2D3748"; // Slightly lighter dark for cards/elements
  const textColor = "#E2E8F0"; // Light gray for text
  const mutedTextColor = "#A0AEC0"; // Muted gray

  const styles = {
    pageContainer: {
      display: "flex",
      minHeight: "100vh",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", // Modern font
      backgroundColor: primaryDark,
      color: textColor,
    },
    // Visual/Branding Section
    visualSection: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "3rem",
      // Dynamic gradient background
     // background: `linear-gradient(${gradientAngle}deg, #003973,rgba(46, 1, 130, 0.46),rgb(197, 11, 20),rgb(246, 191, 62))`, // Example: Deep blues, purples with accents
      // Or a static but rich gradient:
       background: `linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)`,
      backgroundSize: "400% 400%", // For animation if using CSS keyframes
      // animation: "gradientBG 15s ease infinite", // If using CSS keyframes
      color: "white",
      transition: "background 0.1s linear", // Smooth transition for JS-driven gradient
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
        maxWidth: "370px", // Adjusted size
        margin: "0 auto",
    },
    // Form Section
    formSectionContainer: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem", // Padding around the form card
    },
    formCard: {
      width: "100%",
      maxWidth: "520px",
      backgroundColor: secondaryDark,
      padding: "3rem 2.5rem", // Generous padding
      borderRadius: "12px",
      boxShadow: `0 10px 30px rgba(0, 0, 0, 0.5), 0 0 0 1px ${accentColor}30`, // Dark shadow + subtle accent glow
    },
    formHeader: {
      textAlign: "center",
      marginBottom: "2.5rem",
    },
    formIconContainer: {
        display: "inline-flex", // Changed from flex to inline-flex
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: `${accentColor}20`, // Accent with low opacity
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        marginBottom: "1rem",
        border: `2px solid ${accentColor}80`
    },
    formTitle: {
      fontSize: "1.8rem",
      fontWeight: "600", // Semibold
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
      fontSize: "1.1rem", // Slightly larger icon
    },
    input: {
      width: "100%",
      padding: "0.85rem 1rem 0.85rem 3rem", // Adjusted padding for icon
      backgroundColor: primaryDark,
      border: `1px solid #4A5568`, // Tailwind gray-700
      borderRadius: "8px",
      fontSize: "0.95rem",
      color: textColor,
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      outline: "none",
    },
    // Focus style for input (applied via JS for simplicity here)
    inputFocus: {
        borderColor: accentColor,
        boxShadow: `0 0 0 3px ${accentColor}40`, // Accent glow on focus
    },
    button: {
      width: "100%",
      padding: "0.9rem 1.5rem",
      backgroundColor: accentColor,
      color: primaryDark, // Dark text on accent button for contrast
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
      backgroundColor: `${accentColor}90`, // Slightly faded accent
      cursor: "not-allowed",
    },
    spinner: {
        animation: "spin 1s linear infinite",
        height: "1.25rem",
        width: "1.25rem",
        color: primaryDark, // Spinner color matches button text
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
      {/* Visual Section (Left side on Desktop) */}
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

      {/* Form Section (Right side on Desktop) */}
      <div style={styles.formSectionContainer} className="login-form-section">
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <div style={styles.formIconContainer}>
                <FaBuilding style={{ fontSize: "1.8rem", color: accentColor }} />
            </div>
            <h2 style={styles.formTitle}>Admin Secure Access</h2>
            <p style={styles.formSubtitle}>Enter your credentials to manage the portal.</p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={styles.inputGroup}>
              <label htmlFor="email" style={styles.label}>
                Email Address
              </label>
              <div style={styles.inputWrapper}>
                <FaEnvelope style={styles.inputIcon} />
                <input
                  id="email"
                  type="email"
                  placeholder="admin@jainam.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={styles.input}
                  onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => Object.assign(e.target.style, styles.input)} // Reset to base input style
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
                  onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => Object.assign(e.target.style, styles.input)} // Reset to base input style
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
                  <svg style={styles.spinner} xmlns="https://img.freepik.com/free-vector/login-concept-illustration_114360-739.jpg?semt=ais_hybrid&w=740" fill="none" viewBox="0 0 24 24">
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

      {/* CSS for responsiveness and keyframe animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Keyframes for more complex gradient animation (optional, use if not using JS driven) */
        /* @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        } */

        /* Responsive adjustments */
        @media (max-width: 992px) { /* Tablet and below */
          .login-page-container {
            flex-direction: column;
          }
          .login-visual-section {
            flex: 0 1 auto; /* Don't grow, shrink if needed, auto basis */
            min-height: 300px; /* Ensure some height */
            padding: 2rem;
          }
          .login-visual-section .visual-title {
            font-size: 2rem;
          }
          .login-visual-section .lottie-container {
            max-width: 250px;
          }
          .login-form-section {
            flex: 1; /* Take remaining space */
            padding: 1.5rem; /* Reduce padding on mobile */
          }
          .form-card {
            padding: 2rem 1.5rem; /* Reduce card padding */
          }
        }

        @media (max-width: 576px) { /* Small mobile */
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
            box-shadow: none; /* Simpler look on small screens */
          }
        }
      `}</style>
    </div>
  );
};

export default Login;