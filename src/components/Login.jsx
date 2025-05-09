import React, { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../main";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { isAuthenticated, setIsAuthenticated } = useContext(Context);
  const navigateTo = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
      //  "http://localhost:4000/api/v1/user/login",
        "https://jainam-hospital-backend.onrender.com/api/v1/user/login",
        { email, password, confirmPassword, role: "Admin" },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      )
      .then((res) => {
        toast.success(res.data.message);
        setIsAuthenticated(true);
        navigateTo("/");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-form-container">
          <div className="login-header">
            <img 
              src=  "https://st.depositphotos.com/1003492/3320/v/450/depositphotos_33208581-stock-illustration-medical-symbol.jpg" 
              alt="logo" 
              className="logo" 
            />
            <h1 className="login-title">Welcome to ZeeCare</h1>
            <p className="login-subtitle">Admin Portal</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-button">
              Sign In
            </button>
          </form>

          <div className="login-footer">
            <p>Only authorized administrators may access this system</p>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-image-overlay"></div>
        <img 
          src="https://st.depositphotos.com/1003492/3320/v/450/depositphotos_33208581-stock-illustration-medical-symbol.jpg" 
          alt="Medical background" 
          className="login-background-image" 
        />
      </div>
    </div>
  );
};

export default Login;