import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main"; // Assuming Context is correctly imported
import { Navigate } from "react-router-dom";
import { 
  FaEnvelope, FaUser, FaPhone, FaComment, FaTrash, FaReply, 
  FaCalendarAlt, FaSearch, FaInbox, FaCalendarDay, FaClock 
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import Lottie from "lottie-react";
import loadingAnimation from "../../public/loding.json"; // Ensure this path is correct
import emptyAnimation from "../../public/notfountAnimation.json"; // Ensure this path is correct

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useContext(Context);

  const [todayMessagesCount, setTodayMessagesCount] = useState(0);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer); // Cleanup interval on component unmount
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          "https://jainam-hospital-backend.onrender.com/api/v1/message/getall",
          { withCredentials: true }
        );
        setMessages(data.messages || []); // Ensure messages is an array
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch messages");
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) {
      fetchMessages();
    } else {
      setLoading(false); // If not authenticated, stop loading
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (messages.length > 0) {
      const today = new Date();
      const count = messages.filter(message => {
        const messageDate = new Date(message.createdAt);
        return (
          messageDate.getFullYear() === today.getFullYear() &&
          messageDate.getMonth() === today.getMonth() &&
          messageDate.getDate() === today.getDate()
        );
      }).length;
      setTodayMessagesCount(count);
    } else {
      setTodayMessagesCount(0);
    }
  }, [messages]);


  const filteredMessages = messages.filter(message => {
    const searchLower = searchTerm.toLowerCase();
    // Ensure message fields exist before calling toLowerCase
    return (
      (message.firstName && message.firstName.toLowerCase().includes(searchLower)) ||
      (message.lastName && message.lastName.toLowerCase().includes(searchLower)) ||
      (message.email && message.email.toLowerCase().includes(searchLower)) ||
      (message.phone && message.phone.toLowerCase().includes(searchLower)) ||
      (message.message && message.message.toLowerCase().includes(searchLower))
    );
  });

  const handleDelete = async (id) => {
    if (!selectedMessage || selectedMessage._id !== id) {
        // To allow deleting from card directly, we'd need to pass the message object to delete
        // or find it. For now, enforce selection.
        toast.warn("Please select the message in the detail view to delete.");
        return;
    }
    const isConfirmed = window.confirm("Are you sure you want to delete this message?");
    if (!isConfirmed) return;

    try {
      await axios.delete(
        `https://jainam-hospital-backend.onrender.com/api/v1/message/delete/${id}`,
        { withCredentials: true }
      );
      setMessages(prevMessages => prevMessages.filter(msg => msg._id !== id));
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage(null);
      }
      toast.success("Message deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  };

  const handleReply = (email) => {
    if(!email) {
        toast.error("No email address found for this message.");
        return;
    }
    window.location.href = `mailto:${email}`;
  };

  if (!isAuthenticated && !loading) { // Prevent redirect flicker if loading
    return <Navigate to={"/login"} />;
  }

  if (loading) {
    return (
      <div className="loading-container">
        <Lottie 
          animationData={loadingAnimation} 
          loop={true}
          autoplay={true}
          style={{ height: 300, width: 300, overflow: 'hidden' }}
        />
        <p>Loading Messages...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh; /* Full viewport height */
            background-color: #1a1a2e;
            color: #e0e0e0;
            /* margin-left is removed for full screen loading, or adjust if sidebar is persistent */
          }
          .loading-container p {
            margin-top: 0.3rem;
            font-size: 1.25rem;
            font-weight: 500;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="metrics-bar">
        <div className="metric-card total-messages">
          <FaInbox className="metric-icon1" />
          <div className="metric-info">
            <h4>Total Messages</h4>
            <p>{messages.length}</p>
          </div>
        </div>
        <div className="metric-card todays-messages">
          <FaCalendarDay className="metric-icon2" />
          <div className="metric-info">
            <h4>Today's Messages</h4>
            <p>{todayMessagesCount}</p>
          </div>
        </div>
        <div className="metric-card current-time">
          <FaClock className="metric-icon3" />
          <div className="metric-info">
            <h4>{currentDateTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
            <p>{currentDateTime.toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      <div className="messages-wrapper">
        <div className="messages-toolbar">
          <div className="header-title-group">
            <FaEnvelope className="header-main-icon" />
            <div className="header-text">
              <h2>Patient Messages</h2>
              <p>Review and manage patient inquiries and feedback.</p>
            </div>
          </div>
          <div className="search-bar-wrapper">
            <FaSearch className="search-icon-input" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="messages-layout">
          <div className="messages-list-panel">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((message) => (
                <div 
                  className={`message-card ${selectedMessage?._id === message._id ? 'active' : ''}`}
                  key={message._id}
                  onClick={() => setSelectedMessage(message)}
                  tabIndex={0} // Make it focusable
                  onKeyPress={(e) => e.key === 'Enter' && setSelectedMessage(message)} // Accessibility
                >
                  <div className="card-header">
                    <div className="sender-avatar">
                        {message.firstName?.charAt(0)}{message.lastName?.charAt(0)}
                    </div>
                    <span className="sender-name">{message.firstName} {message.lastName}</span>
                    <span className="message-date">{new Date(message.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="message-preview">{message.message.substring(0, 70)}{message.message.length > 70 ? "..." : ""}</p>
                  <div className="card-footer">
                    <MdEmail className="icon email-icon" />
                    <span className="sender-email">{message.email}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Lottie 
                  animationData={emptyAnimation} 
                  loop={true}
                  autoplay={true}
                  style={{ height: 180, width: 180, overflow: 'hidden' }}
                />
                <h3>{searchTerm ? "No Messages Match Your Search" : "Inbox is Empty"}</h3>
                <p>{searchTerm ? "Try different keywords or clear the search." : "There are currently no messages to display."}</p>
              </div>
            )}
          </div>
          
          <div className="message-detail-panel">
            {selectedMessage ? (
              <div className="detail-content-wrapper">
                <div className="detail-header">
                  <h3>Message Details</h3>
                  <div className="action-buttons">
                    <button 
                      className="action-btn reply-btn"
                      onClick={() => handleReply(selectedMessage.email)}
                      title="Reply via Email"
                    >
                      <FaReply /> Reply
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(selectedMessage._id)}
                      title="Delete Message"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
                
                <div className="sender-info-grid">
                  <div className="info-item">
                    <FaUser className="info-icon" />
                    <div>
                      <label>Full Name</label>
                      <p>{selectedMessage.firstName} {selectedMessage.lastName}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <MdEmail className="info-icon" />
                    <div>
                      <label>Email Address</label>
                      <p>{selectedMessage.email}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <FaPhone className="info-icon" />
                    <div>
                      <label>Phone Number</label>
                      <p>{selectedMessage.phone || "N/A"}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <FaCalendarAlt className="info-icon" />
                    <div>
                      <label>Date Received</label>
                      <p>{new Date(selectedMessage.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="message-full-content">
                  <label>Full Message</label>
                  <div className="message-text-area">
                    {selectedMessage.message}
                  </div>
                </div>
              </div>
            ) : (
              <div className="select-prompt">
                <FaEnvelope className="prompt-icon-main" />
                <h3>Select a Message</h3>
                <p>Click on a message from the list to view its details and take actions.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx="true" global="true">{` // Using global for body to ensure no extra scrollbars
        body {
          overflow-x: hidden; /* Prevent horizontal scroll on body */
        }
      `}</style>
      <style jsx="true">{`
        .dashboard-container {
          background-color: #1a1a2e; /* Main background */
          color: #e0e0e0; /* Primary text color */
          min-height: 100vh;
          padding: 1.5rem 2rem; /* Adjusted padding */
          margin-left: 270px; /* Assuming sidebar width */
          font-family: 'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* Modern font stack */
          overflow: hidden; /* Main container overflow hidden */
        }

        .metrics-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* Responsive grid */
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .metric-card {
          background: linear-gradient(145deg, #1e2a4a, #16213e); /* Subtle gradient */
          padding: 1.5rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 1.25rem; /* Increased gap */
          box-shadow: 0 6px 20px rgba(0,0,0,0.25);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .metric-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(77, 124, 254, 0.2);
        }
        .metric-icon1 {
          font-size: 2.8rem; /* Larger icons */
          color:rgb(64, 206, 66);
          flex-shrink: 0; /* Prevent icon shrinking */
        }
           .metric-icon2 {
          font-size: 2.8rem; /* Larger icons */
          color:rgba(233, 254, 77, 0.88);
          flex-shrink: 0; /* Prevent icon shrinking */
        }
           .metric-icon3 {
          font-size: 2.8rem; /* Larger icons */
          color:rgb(254, 77, 183);
          flex-shrink: 0; /* Prevent icon shrinking */
        }
        .metric-info h4 {
          margin: 0 0 0.35rem 0;
          color: #bac8dc; /* Lighter title color */
          font-size: 0.9rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .metric-info p {
          margin: 0;
          font-size: 1.8rem; /* Prominent value */
          font-weight: 700; /* Bold value */
          color: #ffffff;
          line-height: 1.2;
        }
        .metric-card.current-time .metric-info p { font-size: 1.5rem; } /* Adjust size for time */
        .metric-card.current-time .metric-info h4 { font-size: 0.8rem; text-transform:none; letter-spacing: 0;}


        .messages-wrapper {
          background-color: #16213e; /* Consistent dark panel background */
          border-radius: 16px; /* Slightly more rounded */
          padding: 2rem;
          box-shadow: 0 8px 30px rgba(0,0,0,0.35);
        }
        
        .messages-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        
        .header-title-group {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .header-main-icon {
          font-size: 2.8rem;
          color: #4d7cfe;
          padding: 0.5rem;
          background-color: rgba(77, 124, 254, 0.1);
          border-radius: 8px;
        }
        .header-text h2 {
          color: #ffffff;
          margin: 0;
          font-size: 1.9rem; /* Larger heading */
          font-weight: 600;
        }
        .header-text p {
          color: #adb5bd;
          margin: 0.25rem 0 0 0;
          font-size: 0.95rem;
        }
        
        .search-bar-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          min-width: 320px; /* Wider search bar */
        }
        .search-bar-wrapper input {
          padding: 0.85rem 1.25rem 0.85rem 3.2rem; /* More padding */
          border-radius: 10px;
          border: 1px solid #3a4a6b;
          background-color: #0f3460;
          color: #e0e0e0;
          font-size: 1rem;
          width: 100%;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .search-bar-wrapper input::placeholder { color: #7a8b9e; }
        .search-bar-wrapper input:focus {
          outline: none;
          border-color: #4d7cfe;
          box-shadow: 0 0 0 4px rgba(77, 124, 254, 0.25);
        }
        .search-icon-input {
          position: absolute;
          left: 1.2rem;
          color: #7a8b9e;
          font-size: 1.2rem;
        }
        
        .messages-layout {
          display: flex;
          gap: 2rem;
          /* Max height to encourage scrolling within panels, not the whole page */
          max-height: calc(100vh - 270px - 100px - 4rem - 2rem); /* vh - sidebar margin - metrics - toolbar - paddings */
          min-height: 550px;
        }
        
        .messages-list-panel {
          flex: 0 0 400px; /* Wider list panel */
          overflow-y: auto;
          padding-right: 0.5rem; /* Space for scrollbar only if needed */
        }
        
        .messages-list-panel::-webkit-scrollbar,
        .message-detail-panel::-webkit-scrollbar,
        .message-text-area::-webkit-scrollbar {
          width: 10px;
        }
        .messages-list-panel::-webkit-scrollbar-track,
        .message-detail-panel::-webkit-scrollbar-track,
        .message-text-area::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        .messages-list-panel::-webkit-scrollbar-thumb,
        .message-detail-panel::-webkit-scrollbar-thumb,
        .message-text-area::-webkit-scrollbar-thumb {
          background: #3a4a6b;
          border-radius: 10px;
          border: 2px solid #16213e; /* Creates padding around thumb */
        }
        .messages-list-panel::-webkit-scrollbar-thumb:hover,
        .message-detail-panel::-webkit-scrollbar-thumb:hover,
        .message-text-area::-webkit-scrollbar-thumb:hover {
          background: #4d7cfe;
        }

        .message-card {
          background-color: #0f3460;
          border-radius: 12px; /* More rounded */
          padding: 1.25rem;
          margin-bottom: 1.25rem;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
          border: 1px solid #2c3e50; /* Darker border */
          position: relative;
        }
        .message-card:hover {
          background-color: #1f497a;
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.25);
        }
        .message-card.active {
          background-color: #1f497a;
          border-left: 5px solid #4d7cfe;
          padding-left: calc(1.25rem - 4px);
          box-shadow: 0 0 20px rgba(77, 124, 254, 0.25);
        }
        
        .card-header {
          display: flex;
          align-items: center;
          margin-bottom: 0.75rem;
          gap: 0.75rem;
        }
        .sender-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #4d7cfe;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 500;
            font-size: 0.9rem;
            text-transform: uppercase;
        }
        .icon { color: #4d7cfe; }
        .sender-name {
          font-weight: 600;
          color: #ffffff;
          flex-grow: 1;
          font-size: 1.05rem;
        }
        .message-date {
          font-size: 0.8rem;
          color: #9ab0c9; /* Lighter date color */
        }
        .message-preview {
          color: #ced4da;
          margin: 0 0 0.75rem 0;
          font-size: 0.9rem;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .card-footer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-top: 1px solid #2c3e50; /* Subtle separator */
          padding-top: 0.75rem;
          margin-top: 0.75rem;
        }
        .email-icon { font-size: 1rem; }
        .sender-email {
          font-size: 0.85rem;
          color: #9ab0c9;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          padding: 2rem;
          color: #8a9bb3; /* Adjusted color */
        }
        .empty-state h3 {
          color: #ffffff;
          margin: 1.25rem 0 0.75rem;
          font-size: 1.35rem;
        }
        
        .message-detail-panel {
          flex: 1;
          background-color: #0f3460;
          border-radius: 12px;
          padding: 2rem;
          overflow-y: auto;
          border: 1px solid #2c3e50; /* Consistent border */
        }
        
        .detail-content-wrapper {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .detail-header {
          display: flex;
          overflow: hidden;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem; /* Increased space */
          padding-bottom: 1rem; /* Increased space */
          border-bottom: 1px solid #3a4a6b;
        }
        .detail-header h3 {
          color: #ffffff;
          margin: 0;
          font-size: 1.6rem; /* Larger detail title */
          font-weight: 600;
        }
        .action-buttons { display: flex; gap: 1rem; } /* Increased gap */
        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.75rem 1.5rem; /* More padding */
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          box-shadow: 0 2px 5px rgba(0,0,0,0.15);
        }
        .reply-btn { background-color: #4d7cfe; color: white; }
        .reply-btn:hover { background-color: #3a6aed; box-shadow: 0 4px 10px rgba(77, 124, 254, 0.3); }
        .delete-btn { background-color: #e74c3c; color: white; }
        .delete-btn:hover { background-color: #c0392b; box-shadow: 0 4px 10px rgba(231, 76, 60, 0.3); }
        
        .sender-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .info-item {
          display: flex;
          align-items: flex-start;
          overflow: hidden;
          gap: 1rem; /* Increased gap */
          background-color: #16213e;
          padding: 1.25rem; /* More padding */
          border-radius: 10px;
        }
        .info-icon {
          color: #4d7cfe;
          font-size: 1.3rem;
          margin-top: 0.15rem;
        }
        .info-item label {
          display: block;
          color: #adb5bd;
          font-size: 0.85rem; /* Slightly larger label */
          margin-bottom: 0.4rem;
          text-transform: uppercase;
          font-weight: 500;
        }
        .info-item p {
          color: #f0f0f0;
          margin: 0;
          font-size: 1rem; /* Larger text */
          word-break: break-all;
        }
        
        .message-full-content { flex-grow: 1; display: flex; flex-direction: column; overflow: hidden; }
        .message-full-content label {
          display: block;
          color: #adb5bd;
          font-size: 1rem; /* Larger label */
          font-weight: 600;
          margin-bottom: 1rem;
        }
        .message-text-area {
          background-color: #16213e;
          border-radius: 10px;
          padding: 1.5rem;
          color: #e0e0e0;
          line-height: 1.7; /* Increased line height */
          font-size: 1rem;
          white-space: pre-wrap;
          overflow-y: auto  ;
          flex-grow: 1;
          min-height: 200px; /* Ensure enough space */
          border: 1px solid #3a4a6b;
        }
        
        .select-prompt {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          color: #adb5bd;
          padding: 2rem;
          background-color: rgba(0,0,0,0.1); /* Subtle background */
          border-radius: 12px;
        }
        .prompt-icon-main {
          font-size: 4.5rem; /* Larger icon */
          color: #4d7cfe;
          margin-bottom: 1.75rem;
          opacity: 0.6;
        }
        .select-prompt h3 {
          color: #ffffff;
          margin: 0.5rem 0 1.25rem 0;
          font-size: 1.6rem; /* Larger title */
        }
        .select-prompt p { max-width: 420px; line-height: 1.6; font-size: 0.95rem;}
        
        /* Responsive Adjustments */
        @media (max-width: 1399px) { /* Adjust breakpoint for sidebar */
          .dashboard-container {
            margin-left: 0;
            padding: 1.5rem;
          }
           .messages-layout {
             /* Adjust max-height when sidebar might be overlaid or hidden */
             max-height: calc(100vh - 100px - 4rem - 2rem); /* vh - metrics - toolbar - paddings */
           }
        }
        @media (max-width: 992px) {
          .metrics-bar { grid-template-columns: 1fr; } /* Stack metrics on smaller screens */
          .messages-layout {
            flex-direction: column;
            max-height: none; /* Allow content to define height */
            min-height: auto;
          }
          .messages-list-panel {
            flex: 0 0 auto;
            max-height: 40vh; /* Limit height when stacked */
            width: 100%;
            margin-bottom: 1.5rem;
          }
          .message-detail-panel { min-height: 45vh; }
          .messages-toolbar { flex-direction: column; align-items: stretch; }
          .search-bar-wrapper { min-width: auto; width: 100%; }
        }
        @media (max-width: 768px) {
          .dashboard-container { padding: 1rem; }
          .messages-wrapper { padding: 1.5rem; }
          .header-title-group { flex-direction: column; align-items: flex-start; gap: 0.5rem;}
          .header-text h2 { font-size: 1.6rem;}
          .header-text p { font-size: 0.9rem;}
          .metric-card { flex-direction: column; align-items: flex-start; text-align: left;}
          .metric-icon1 { font-size: 2.2rem; }
          .metric-info p { font-size: 1.5rem; }
          .metric-card.current-time .metric-info p { font-size: 1.3rem; }
        }
        @media (max-width: 576px) {
          .messages-wrapper { padding: 1rem; }
          .message-detail-panel { padding: 1.5rem; }
          .detail-header { flex-direction: column; align-items: stretch; gap: 1rem; }
          .action-buttons { flex-direction: column; width: 100%; }
          .action-btn { justify-content: center; }
          .sender-info-grid { grid-template-columns: 1fr; gap: 1rem; }
          .info-item { padding: 1rem; }
          .message-text-area { padding: 1rem; font-size: 0.95rem; min-height: 150px;}
          .select-prompt h3 { font-size: 1.3rem; }
          .select-prompt p { font-size: 0.9rem; }
          .messages-list-panel { max-height: 35vh; }
          .message-detail-panel { min-height: 40vh; }
        }
      `}</style>
    </div>
  );
};

export default Messages;