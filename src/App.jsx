import React, { useContext, useEffect } from "react";
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
import ProfilePage from "./components/AdminProfile";
import PatientsDashboard from "./components/getAllpasent";
import ChatRoom from "./components/ChatRoom";
import DescriptionDashboard from "./components/DescriptionDetailPage";
import DescriptionBill from "./components/MedicalDescriptions";
const App = () => {
  const { isAuthenticated, setIsAuthenticated, admin, setAdmin } =
    useContext(Context);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          "https://jainam-hospital-backend.onrender.com/api/v1/user/admin/me",
          //"http://localhost:4000/api/v1/user/admin/me",
          {
            withCredentials: true,
          }
        );
        setIsAuthenticated(true);
        setAdmin(response.data.user);
      } catch (error) {
        setIsAuthenticated(false);
        setAdmin({});
      }
    };
    fetchUser();
  }, [isAuthenticated]);

  return (
    <Router>
      <Sidebar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/doctor/addnew" element={<AddNewDoctor />} />
        <Route path="/admin/addnew" element={<AddNewAdmin />} />
        <Route path="/ChatRoom" element={<ChatRoom/>} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/admin/profile" element={<ProfilePage/>}/>
        <Route path="/PatientsDashboard" element={<PatientsDashboard/>}/>
        <Route path="/description-bill" element={<DescriptionBill />} />
        <Route path="/description/:id" element={<DescriptionDashboard />} />
      </Routes>
      <ToastContainer position="top-center" />
    </Router>
  );
};

export default App;
