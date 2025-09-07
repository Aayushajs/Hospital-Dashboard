import { API_BASE_URL } from "./api";
import React, { useContext, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard";
import Login from "./components/Login";
import AddNewDoctor from "./components/AddNewDoctor";
import Messages from "./components/Messages";
import Doctors from "./components/Doctors";
import { Context } from "./main";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./components/Sidebar";
import AddNewAdmin from "./components/AddNewAdmin";
import "./App.css";
import ProfilePage from "./components/Profile"; // unified profile for admin & doctor
import PatientsDashboard from "./components/getAllpasent";
import ChatRoom from "./components/ChatRoom";
import DescriptionDashboard from "./components/DescriptionDetailPage";
import DescriptionBill from "./components/MedicalDescriptions";
import DoctorDashboard from "./components/Doctor/DoctorDashboard";
import AppointmentDetail from "./components/Doctor/AppointmentDetail"; // new detail page
import OfflineAnimation from "./components/OfflineAnimation";
import Prescriptions from "./components/Doctor/Prescriptions";

const App = () => {
  const {
    isAuthenticated,
    setIsAuthenticated,
    isDoctorAuthenticated,
    setIsDoctorAuthenticated,
    admin,
    setAdmin,
    doctor,
    setDoctor,
  } = useContext(Context);

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Reload the page to ensure everything is re-initialized correctly
      window.location.reload();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup listeners on component unmount
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/user/admin/me`,
          { withCredentials: true }
        );
        setIsAuthenticated(true);
        setAdmin(response.data.user);
      } catch (error) {
        setIsAuthenticated(false);
        setAdmin({});
      }
    };

    const fetchDoctor = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/user/doctor/me`,
          { withCredentials: true }
        );
        setIsDoctorAuthenticated(true);
        setDoctor(response.data.user);
      } catch (error) {
        setIsDoctorAuthenticated(false);
        setDoctor({});
      }
    };

    if (isOnline) {
      fetchAdmin();
      fetchDoctor();
    }
  }, [
    isOnline,
    isAuthenticated,
    isDoctorAuthenticated,
    setAdmin,
    setDoctor,
    setIsAuthenticated,
    setIsDoctorAuthenticated,
  ]);

  if (!isOnline) {
    return <OfflineAnimation />;
  }

  return (
    <Router>
      {/* Show sidebar only for authenticated users */}
      {(isAuthenticated || isDoctorAuthenticated) && <Sidebar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        {isAuthenticated && (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/doctor/addnew" element={<AddNewDoctor />} />
            <Route path="/admin/addnew" element={<AddNewAdmin />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/admin/profile" element={<ProfilePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/PatientsDashboard" element={<PatientsDashboard />} />
            <Route path="/description-bill" element={<DescriptionBill />} />
            <Route path="/description/:id" element={<DescriptionDashboard />} />
            <Route path="/ChatRoom" element={<ChatRoom />} />
          </>
        )}

        {/* Doctor Routes */}
        {isDoctorAuthenticated && (
          <>
            <Route path="/" element={<DoctorDashboard />} />
            <Route path="/DocterDashboard" element={<DoctorDashboard />} />
            <Route
              path="/doctor/appointment/:id"
              element={<AppointmentDetail />}
            />
            <Route path="/doctor/prescriptions/add" element={<Prescriptions />} />
            <Route path="/doctor/profile" element={<ProfilePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </>
        )}

        {/* Fallback route - redirect based on auth status */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Dashboard />
            ) : isDoctorAuthenticated ? (
              <DoctorDashboard />
            ) : (
              <Login />
            )
          }
        />
      </Routes>

      <ToastContainer position="top-center" />
    </Router>
  );
};

export default App;
