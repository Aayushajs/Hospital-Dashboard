import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import {
  FaUser, FaPhone, FaEnvelope, FaCalendarAlt,
  FaMoneyBillWave, FaSearch, FaTrash, FaPaperPlane,
  FaSync, FaTimes, FaUserInjured, FaUserMd, FaWallet, FaCheck
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import Lottie from "lottie-react";
import loadingAnimation from "../../public/loding.json";
import emptyAnimation from "../../public/profile-animation.json";
import noRecordsAnimation from "../../public/notfountAnimation.json";
import { io } from "socket.io-client";

const ChatRoom = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { isAuthenticated, user } = useContext(Context);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const API_BASE_URL = "https://jainam-hospital-backend.onrender.com";
  const WS_BASE_URL = "wss://jainam-hospital-backend.onrender.com";

  // Metrics data
  const totalPatients = patients.length;
  const doctorAppointments = appointments.length;
  const totalRevenue = appointments.reduce((sum, app) => sum + (app.fees || 0), 0);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const appointmentsRes = await axios.get(
          `${API_BASE_URL}/api/v1/appointment/getall`,
          { withCredentials: true }
        );
        setAppointments(appointmentsRes.data?.appointments || []);
        
        const patientsRes = await axios.get(
          `${API_BASE_URL}/api/v1/user/getAllPatiens`,
          { withCredentials: true }
        );
        setPatients(patientsRes.data?.patients || []);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(error.response?.data?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedAppointment) {
      fetchMessages(selectedAppointment._id);
      setupSocketConnection(selectedAppointment._id);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [selectedAppointment]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const setupSocketConnection = (appointmentId) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    try {
      socketRef.current = io(WS_BASE_URL, {
        path: "/socket.io",
        transports: ["websocket"],
        query: { roomId: appointmentId },
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
        timeout: 10000,
      });

      socketRef.current.on("connect", () => {
        console.log("Socket connected");
        setIsConnected(true);
        socketRef.current.emit("join_room", appointmentId);
      });

      socketRef.current.on("receive_message", (message) => {
        if (message && message._id && message.sender && message.message) {
          setMessages(prev => {
            const exists = prev.some(msg => msg._id === message._id);
            return exists ? prev : [...prev, message];
          });
        }
      });

      socketRef.current.on("message_deleted", ({ messageId }) => {
        if (messageId) {
          setMessages(prev => prev.filter((msg) => msg._id !== messageId));
        }
      });

      socketRef.current.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      });

      socketRef.current.on("connect_error", (err) => {
        console.error("Connection error:", err);
        setIsConnected(false);
      });
    } catch (err) {
      console.error("Error setting up socket:", err);
      setIsConnected(false);
    }
  };

  const fetchMessages = async (appointmentId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/chat/messages/${appointmentId}`,
        { withCredentials: true }
      );
      
      if (response.data?.messages && Array.isArray(response.data.messages)) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedAppointment || isSending || !user) {
      toast.warning("Cannot send empty message or no patient selected");
      return;
    }

    try {
      setIsSending(true);
      const senderName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Unknown';

      const messageData = {
        roomId: selectedAppointment._id,
        sender: senderName,
        message: newMessage,
      };

      // Optimistically add the message
      const tempId = Date.now().toString();
      setMessages(prev => [...prev, {
        ...messageData,
        _id: tempId,
        isOptimistic: true,
        timestamp: new Date().toISOString()
      }]);

      // Always send via HTTP first for reliability
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/chat/send`,
        messageData,
        { 
          withCredentials: true,
          timeout: 10000 
        }
      );
      
      if (response.data?.success && response.data?.message) {
        // Replace optimistic message with server response
        setMessages(prev => prev.map(msg => 
          msg._id === tempId ? response.data.message : msg
        ));

        // Also emit via socket if connected
        if (isConnected && socketRef.current?.connected) {
          socketRef.current.emit("send_message", {
            room: selectedAppointment._id,
            sender: senderName,
            message: newMessage,
          });
        }
      }

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      // Remove optimistic message if send fails
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!messageId || !selectedAppointment) return;

    try {
      setMessages(prev => prev.filter((msg) => msg._id !== messageId));

      // First try via HTTP
      await axios.delete(
        `${API_BASE_URL}/api/v1/chat/delete/${selectedAppointment._id}/${messageId}`,
        { withCredentials: true }
      );

      // Then notify via socket if connected
      if (isConnected && socketRef.current?.connected) {
        socketRef.current.emit("delete_message", {
          roomId: selectedAppointment._id,
          messageId: messageId,
        });
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
      fetchMessages(selectedAppointment._id);
    }
  };

  const confirmDelete = (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      handleDeleteMessage(messageId);
    }
  };

  const handleAppointmentSelect = (appointment) => {
    const patient = patients.find(p => p._id === appointment.patientId);
    if (patient) {
      setSelectedPatient(patient);
      setSelectedAppointment(appointment);
    }
  };

  const handlePatientSelect = (patient) => {
    // Find the latest appointment for this patient
    const patientAppointments = appointments.filter(app => app.patientId === patient._id);
    const latestAppointment = patientAppointments.sort(
      (a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate)
    )[0];
    
    setSelectedPatient(patient);
    if (latestAppointment) {
      setSelectedAppointment(latestAppointment);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (patient.firstName && patient.firstName.toLowerCase().includes(searchLower)) ||
      (patient.lastName && patient.lastName.toLowerCase().includes(searchLower)) ||
      (patient.email && patient.email.toLowerCase().includes(searchLower)) ||
      (patient.phone && patient.phone.toString().includes(searchTerm))
    );
  });

  if (!isAuthenticated && !loading) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="loading-container">
        <Lottie
          animationData={loadingAnimation}
          loop={true}
          autoplay={true}
          style={{ height: 300, width: 300 }}
        />
        <p>Loading Data...</p>
      </div>
    );
  }

  return (
    <div className="chat-room-container">
      {/* Metrics Section */}
      <div className="metrics-bar">
        <div className="metric-card total-patients">
          <FaUserInjured className="metric-icon" />
          <div className="metric-info">
            <h4>Total Patients</h4>
            <p>{totalPatients}</p>
          </div>
        </div>
        
        <div className="metric-card doctor-appointments">
          <FaUserMd className="metric-icon" />
          <div className="metric-info">
            <h4>Your Appointments</h4>
            <p>{doctorAppointments}</p>
          </div>
        </div>
        
        <div className="metric-card total-revenue">
          <FaWallet className="metric-icon" />
          <div className="metric-info">
            <h4>Total Revenue</h4>
            <p>₹{totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="appointments-section">
        <h3>Your Appointments</h3>
        <div className="appointments-list">
          {appointments.length > 0 ? (
            appointments.map(appointment => {
              const patient = patients.find(p => p._id === appointment.patientId);
              const isSelected = selectedAppointment?._id === appointment._id;
              
              return (
                <div 
                  key={appointment._id} 
                  className={`appointment-card ${isSelected ? 'active' : ''}`}
                >
                  <div className="appointment-select">
                    <button
                      className={`select-checkbox ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleAppointmentSelect(appointment)}
                    >
                      {isSelected && <FaCheck size={10} />}
                    </button>
                  </div>
                  <div 
                    className="appointment-info"
                    onClick={() => handleAppointmentSelect(appointment)}
                  >
                    <h4>
                      {patient?.firstName || 'Patient'} 
                      {patient?.lastName || ''}
                    </h4>
                    <p><FaCalendarAlt /> {new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                    <p><FaMoneyBillWave /> ₹{appointment.fees}</p>
                  </div>
                  <div className="appointment-status">
                    <span className={`status-badge ${appointment.status}`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-appointments">
              <p>No appointments found</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="chat-room-content">
        {/* Patients List Panel */}
        <div className="patients-list-panel">
          <div className="panel-header">
            <h3>Patients List</h3>
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="patients-list">
            {filteredPatients.length > 0 ? (
              filteredPatients.map(patient => {
                const isSelected = selectedPatient?._id === patient._id;
                return (
                  <div
                    key={patient._id}
                    className={`patient-card ${isSelected ? 'active' : ''} ${patient.isDoctor ? 'doctor-profile' : ''}`}
                  >
                    <div className="patient-select">
                      <button
                        className={`select-checkbox ${isSelected ? 'selected' : ''}`}
                        onClick={() => handlePatientSelect(patient)}
                      >
                        {isSelected && <FaCheck size={10} />}
                      </button>
                    </div>
                    <div 
                      className="patient-info-container"
                      onClick={() => handlePatientSelect(patient)}
                    >
                      <div className="patient-avatar">
                        {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
                      </div>
                      <div className="patient-info">
                        <h4>{patient.firstName} {patient.lastName} {patient.isDoctor && '(You)'}</h4>
                        <p><MdEmail /> {patient.email}</p>
                        <p><FaPhone /> {patient.phone}</p>
                        {patient.dob && <p><FaCalendarAlt /> {new Date(patient.dob).toLocaleDateString()}</p>}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <Lottie
                  animationData={emptyAnimation}
                  loop={true}
                  style={{ height: 180, width: 180, overflow: 'hidden' }}
                />
                <h3>{searchTerm ? "No Patients Found" : "No Patients"}</h3>
                <p>{searchTerm ? "Try different search terms" : "No patients registered yet"}</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="chat-panel">
          {selectedPatient ? (
            <>
              <div className="chat-header">
                <h3>Chat with {selectedPatient.firstName} {selectedPatient.lastName} {selectedPatient.isDoctor && '(Yourself)'}</h3>
                <div className="connection-status">
                  <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
                  {isConnected ? 'Live' : 'Offline'}
                  {!isConnected && (
                    <button onClick={() => setupSocketConnection(selectedAppointment._id)} className="retry-btn">
                      <FaSync size={12} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="chat-messages">
                {messages.length > 0 ? (
                  messages.map(message => (
                    <div
                      key={message._id}
                      className={`message ${message.sender === `${user.firstName} ${user.lastName}` ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">
                        <div className="message-sender">{message.sender}</div>
                        <div className="message-text">{message.message}</div>
                        <div className="message-time">
                          {new Date(message.timestamp || message.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                      {message.sender === `${user.firstName} ${user.lastName}` && (
                        <button
                          onClick={() => confirmDelete(message._id)}
                          className="delete-btn"
                          title="Delete message"
                        >
                          <FaTrash size={12} />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="no-messages">
                    <Lottie
                      animationData={noRecordsAnimation}
                      loop={true}
                      style={{ width: 200, height: 200, overflow: 'hidden' }}
                    />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="chat-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isSending || selectedPatient.isDoctor}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending || selectedPatient.isDoctor}
                >
                  {isSending ? 'Sending...' : <><FaPaperPlane /> Send</>}
                </button>
              </div>
            </>
          ) : (
            <div className="select-prompt">
              <FaUser className="prompt-icon" />
              <h3>Select a Patient</h3>
              <p>Choose a patient from the list to view chat history and send messages.</p>
            </div>
          )}
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .chat-room-container {
          background-color: #1a1a2e;
          color: #e0e0e0;
          min-height: 100vh;
          padding: 1.5rem 2rem;
          margin-left: 270px;
          font-family: 'Roboto', sans-serif;
        }

        .metrics-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .metric-card {
          background: linear-gradient(145deg, #1e2a4a, #16213e);
          padding: 1.5rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          box-shadow: 0 6px 20px rgba(0,0,0,0.25);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .metric-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(77, 124, 254, 0.2);
        }

        .metric-icon {
          font-size: 2.8rem;
          flex-shrink: 0;
        }

        .total-patients .metric-icon { color: #4d7cfe; }
        .doctor-appointments .metric-icon { color: #10b981; }
        .total-revenue .metric-icon { color: #f59e0b; }

        .metric-info h4 {
          margin: 0 0 0.35rem 0;
          color: #bac8dc;
          font-size: 0.9rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .metric-info p {
          margin: 0;
          font-size: 1.8rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.2;
        }

        .appointments-section {
          background-color: #16213e;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .appointments-section h3 {
          color: #ffffff;
          margin-top: 0;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
        }

        .appointments-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }

        .appointment-card {
          display: flex;
          align-items: center;
          padding: 12px;
          border-radius: 8px;
          background: #2d3748;
          margin-bottom: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .appointment-card:hover {
          background: #3c4a5e;
        }

        .appointment-card.active {
          background: #3b82f6;
        }

        .appointment-select {
          margin-right: 12px;
        }

        .select-checkbox {
          width: 18px;
          height: 18px;
          border: 2px solid #718096;
          border-radius: 4px;
          cursor: pointer;
          position: relative;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          padding: 0;
        }

        .select-checkbox.selected {
          background-color: #3b82f6;
          border-color: #3b82f6;
        }

        .select-checkbox.selected svg {
          color: white;
        }

        .appointment-info {
          flex: 1;
        }

        .appointment-status {
          margin-left: 12px;
        }

        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-badge.pending {
          background-color: #f59e0b;
          color: #1a1a2e;
        }

        .status-badge.completed {
          background-color: #10b981;
          color: #ffffff;
        }

        .status-badge.cancelled {
          background-color: #ef4444;
          color: #ffffff;
        }

        .empty-appointments {
          color: #8a9bb3;
          text-align: center;
          padding: 1rem;
        }

        .chat-room-content {
          display: flex;
          gap: 2rem;
          height: calc(100vh - 400px);
        }

        .patients-list-panel {
          flex: 0 0 350px;
          background-color: #16213e;
          border-radius: 12px;
          padding: 1.5rem;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          margin-bottom: 1.5rem;
        }

        .panel-header h3 {
          color: #ffffff;
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .search-bar {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-bar input {
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border-radius: 8px;
          border: 1px solid #3a4a6b;
          background-color: #0f3460;
          color: #e0e0e0;
          font-size: 1rem;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          color: #7a8b9e;
        }

        .patients-list {
          flex: 1;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .patient-card {
          background-color: #0f3460;
          border-radius: 10px;
          padding: 1rem;
          margin-bottom: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid #2c3e50;
          display: flex;
          gap: 1rem;
        }

        .patient-card:hover {
          background-color: #1f497a;
          transform: translateY(-2px);
        }

        .patient-card.active {
          background-color: #1f497a;
          border-left: 4px solid #4d7cfe;
        }

        .patient-card.doctor-profile {
          background-color: #1a3a5a;
          border-left: 4px solid #10b981;
        }

        .patient-select {
          display: flex;
          align-items: center;
          margin-right: 8px;
        }

        .patient-info-container {
          display: flex;
          flex: 1;
          gap: 1rem;
        }

        .patient-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: #4d7cfe;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .patient-card.doctor-profile .patient-avatar {
          background-color: #10b981;
        }

        .patient-info {
          flex: 1;
        }

        .patient-info h4 {
          margin: 0 0 0.25rem 0;
          color: #ffffff;
          font-size: 1.05rem;
        }

        .patient-info p {
          margin: 0.25rem 0;
          font-size: 0.85rem;
          color: #adb5bd;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          padding: 2rem;
          color: #8a9bb3;
        }

        .empty-state h3 {
          color: #ffffff;
          margin: 1.25rem 0 0.75rem;
          font-size: 1.35rem;
        }

        .chat-panel {
          flex: 1;
          background-color: #16213e;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #3a4a6b;
        }

        .chat-header h3 {
          color: #ffffff;
          margin: 0;
          font-size: 1.5rem;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #adb5bd;
        }

        .status-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .status-indicator.connected {
          background-color: #10b981;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
        }

        .status-indicator.disconnected {
          background-color: #ef4444;
        }

        .retry-btn {
          background: none;
          border: none;
          color: #4d7cfe;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8rem;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          background-color: #0f3460;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .message {
          display: flex;
          margin-bottom: 1rem;
          max-width: 80%;
        }

        .message.sent {
          margin-left: auto;
          flex-direction: row-reverse;
        }

        .message.received {
          margin-right: auto;
        }

        .message-content {
          padding: 0.75rem 1rem;
          border-radius: 12px;
          position: relative;
        }

        .message.sent .message-content {
          background-color: #4d7cfe;
          color: white;
          border-top-right-radius: 0;
        }

        .message.received .message-content {
          background-color: #2c3e50;
          border-top-left-radius: 0;
        }

        .message-sender {
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .message-text {
          font-size: 0.95rem;
          line-height: 1.4;
        }

        .message-time {
          font-size: 0.7rem;
          text-align: right;
          margin-top: 0.25rem;
          opacity: 0.8;
        }

        .delete-btn {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          align-self: center;
          margin: 0 0.5rem;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .message:hover .delete-btn {
          opacity: 1;
        }

        .no-messages {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          color: #8a9bb3;
        }

        .chat-input {
          display: flex;
          gap: 1rem;
        }

        .chat-input input {
          flex: 1;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: 1px solid #3a4a6b;
          background-color: #0f3460;
          color: #e0e0e0;
          font-size: 1rem;
        }

        .chat-input button {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          border: none;
          background-color: #4d7cfe;
          color: white;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: background-color 0.2s ease;
        }

        .chat-input button:hover {
          background-color: #3a6aed;
        }

        .chat-input button:disabled {
          background-color: #3a4a6b;
          cursor: not-allowed;
        }

        .select-prompt {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          color: #adb5bd;
        }

        .prompt-icon {
          font-size: 3rem;
          color: #4d7cfe;
          margin-bottom: 1rem;
          opacity: 0.6;
        }

        .select-prompt h3 {
          color: #ffffff;
          margin: 0.5rem 0 1rem 0;
          font-size: 1.5rem;
        }

        .select-prompt p {
          max-width: 350px;
          line-height: 1.5;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background-color: #1a1a2e;
          color: #e0e0e0;
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: #3a4a6b;
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #4d7cfe;
        }

        /* Responsive adjustments */
        @media (max-width: 1200px) {
          .chat-room-container {
            margin-left: 0;
            padding: 1.5rem;
          }
        }

        @media (max-width: 992px) {
          .chat-room-content {
            flex-direction: column;
            height: auto;
          }

          .patients-list-panel {
            flex: 0 0 auto;
            max-height: 400px;
          }

          .chat-panel {
            min-height: 500px;
          }
        }

        @media (max-width: 768px) {
          .metrics-bar {
            grid-template-columns: 1fr;
          }

          .appointments-list {
            grid-template-columns: 1fr;
          }

          .chat-room-container {
            padding: 1rem;
          }

          .message {
            max-width: 90%;
          }
        }

        @media (max-width: 576px) {
          .chat-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .connection-status {
            margin-left: auto;
          }

          .chat-input {
            flex-direction: column;
          }

          .chat-input button {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatRoom;