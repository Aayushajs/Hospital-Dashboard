import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import { FaEnvelope, FaUser, FaPhone, FaComment, FaTrash, FaReply, FaCalendarAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import Lottie from "lottie-react";
import loadingAnimation from "../../public/loding.json";
import emptyAnimation from "../../public/notfountAnimation.json";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useContext(Context);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(
          "https://jainam-hospital-backend.onrender.com/api/v1/message/getall",
          { withCredentials: true }
        );
        setMessages(data.messages);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch messages");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const filteredMessages = messages.filter(message => {
    const searchLower = searchTerm.toLowerCase();
    return (
      message.firstName.toLowerCase().includes(searchLower) ||
      message.lastName.toLowerCase().includes(searchLower) ||
      message.email.toLowerCase().includes(searchLower) ||
      message.phone.toLowerCase().includes(searchLower) ||
      message.message.toLowerCase().includes(searchLower)
    );
  });

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `https://jainam-hospital-backend.onrender.com/api/v1/message/delete/${id}`,
        { withCredentials: true }
      );
      setMessages(messages.filter(msg => msg._id !== id));
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage(null);
      }
      toast.success("Message deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  };

  const handleReply = (email) => {
    window.location.href = `mailto:${email}`;
  };

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  if (loading) {
    return (
      <div className="loading-container">
        <Lottie 
          animationData={loadingAnimation} 
          style={{ overflow:"hidden", height: 400, width: 400, marginLeft: "10%" }}
        />
        <p>Loading messages...</p>
        
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
      <div className="messages-wrapper">
        <div className="messages-header">
          <div className="header-content">
            <FaEnvelope className="header-icon" />
            <h2>Patient Messages</h2>
            <p>Review and manage all patient inquiries and feedback</p>
          </div>
          
          <div className="search-container">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaComment className="search-icon" />
          </div>
        </div>
        
        <div className="messages-content">
          <div className="messages-list">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((message) => (
                <div 
                  className={`message-card ${selectedMessage?._id === message._id ? 'active' : ''}`}
                  key={message._id}
                  onClick={() => setSelectedMessage(message)}
                >
                  <div className="message-header">
                    <div className="sender-info">
                      <FaUser className="icon" />
                      <span>{message.firstName} {message.lastName}</span>
                    </div>
                    <div className="message-date">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="message-preview">
                    <p>{message.message.substring(0, 60)}...</p>
                  </div>
                  <div className="message-footer">
                    <div className="message-email">
                      <MdEmail className="icon" />
                      <span>{message.email}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-messages">
                <Lottie 
                  animationData={emptyAnimation} 
                  style={{ height: 200, width: 200, overflow: "hidden" }}
                />
                <h3>No Messages Found</h3>
                <p>Try adjusting your search criteria</p>
              </div>
            )}
          </div>
          
          <div className="message-detail">
            {selectedMessage ? (
              <div className="detail-card">
                <div className="detail-header">
                  <h3>Message Details</h3>
                  <div className="action-buttons">
                    <button 
                      className="reply-btn"
                      onClick={() => handleReply(selectedMessage.email)}
                    >
                      <FaReply /> Reply
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(selectedMessage._id)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
                
                <div className="sender-details">
                  <div className="detail-item">
                    <FaUser className="icon" />
                    <div>
                      <label>Name</label>
                      <p>{selectedMessage.firstName} {selectedMessage.lastName}</p>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <MdEmail className="icon" />
                    <div>
                      <label>Email</label>
                      <p>{selectedMessage.email}</p>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <FaPhone className="icon" />
                    <div>
                      <label>Phone</label>
                      <p>{selectedMessage.phone}</p>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <FaCalendarAlt className="icon" />
                    <div>
                      <label>Date Sent</label>
                      <p>{new Date(selectedMessage.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="message-content">
                  <label>Message</label>
                  <div className="message-text">
                    {selectedMessage.message}
                  </div>
                </div>
              </div>
            ) : (
              <div className="select-message-prompt">
                <FaEnvelope className="prompt-icon" />
                <h3>Select a message to view details</h3>
                <p>Click on any message from the list to see its full content</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          background-color: #1a1a2e;
          color: #e9ecef;
          min-height: 100vh;
          padding: 2rem;
          margin-left: 270px;
        }
        
        .messages-wrapper {
          background-color: #16213e;
          border-radius: 10px;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .messages-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .header-content {
          display: flex;
          flex-direction: column;
        }
        
        .header-icon {
          font-size: 2rem;
          color: #4d7cfe;
          margin-bottom: 0.5rem;
        }
        
        .messages-header h2 {
          color: white;
          margin: 0.25rem 0;
          font-size: 1.8rem;
        }
        
        .messages-header p {
          color: #adb5bd;
          margin: 0;
        }
        
        .search-container {
          position: relative;
          min-width: 250px;
        }
        
        .search-container input {
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border-radius: 6px;
          border: 1px solid #3a4a6b;
          background-color: #0f3460;
          color: white;
          font-size: 0.95rem;
          width: 100%;
        }
        
        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #adb5bd;
        }
        
        .messages-content {
          display: flex;
          gap: 2rem;
          height: calc(100vh - 250px);
          overflow: hidden;
        }
        
        .messages-list {
          flex: 0 0 350px;
          overflow: auto ;
          
          padding-right: 0.5rem;
        }
        
        .message-card {
          background-color: #0f3460;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border-left: 3px solid transparent;
        }
        
        .message-card:hover {
          background-color: #1a3a6a;
        }
        
        .message-card.active {
          background-color: #1a3a6a;
          border-left: 3px solid #4d7cfe;
        }
        
        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .sender-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }
        
        .message-date {
          font-size: 0.8rem;
          color: #adb5bd;
        }
        
        .message-preview p {
          color: #e9ecef;
          margin: 0.5rem 0;
          font-size: 0.9rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .message-footer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #adb5bd;
        }
        
        .no-messages {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          text-align: center;
        }
        
        .no-messages h3 {
          color: white;
          margin: 1rem 0 0.5rem;
        }
        
        .no-messages p {
          color: #adb5bd;
          margin: 0;
        }
        
        .message-detail {
          flex: 1;
          background-color: #0f3460;
          border-radius: 8px;
          padding: 1.5rem;
          overflow-y: auto;
        }
        
        .detail-card {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid #3a4a6b;
          padding-bottom: 1rem;
        }
        
        .detail-header h3 {
          color: white;
          margin: 0;
        }
        
        .action-buttons {
          display: flex;
          gap: 0.75rem;
        }
        
        .reply-btn, .delete-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .reply-btn {
          background-color: #4d7cfe;
          color: white;
          border: none;
        }
        
        .reply-btn:hover {
          background-color: #3a6aed;
        }
        
        .delete-btn {
          background-color: transparent;
          color: #ff6b6b;
          border: 1px solid #ff6b6b;
        }
        
        .delete-btn:hover {
          background-color: rgba(255, 107, 107, 0.1);
        }
        
        .sender-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .detail-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }
        
        .detail-item .icon {
          color: #4d7cfe;
          margin-top: 0.25rem;
        }
        
        .detail-item label {
          display: block;
          color: #adb5bd;
          font-size: 0.8rem;
          margin-bottom: 0.25rem;
        }
        
        .detail-item p {
          color: white;
          margin: 0;
          font-size: 0.95rem;
        }
        
        .message-content {
          flex: 1;
        }
        
        .message-content label {
          display: block;
          color: #adb5bd;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }
        
        .message-text {
          background-color: #16213e;
          border-radius: 6px;
          padding: 1rem;
          color: white;
          height: calc(100% - 50px);
          overflow-y: auto;
          white-space: pre-wrap;
        }
        
        .select-message-prompt {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
        }
        
        .prompt-icon {
          font-size: 3rem;
          color: #4d7cfe;
          margin-bottom: 1rem;
        }
        
        .select-message-prompt h3 {
          color: white;
          margin: 0.5rem 0;
        }
        
        .select-message-prompt p {
          color: #adb5bd;
          margin: 0;
        }
        
        /* Responsive Adjustments */
        @media (max-width: 1200px) {
          .dashboard-container {
            margin-left: 0;
          }
        }
        
        @media (max-width: 992px) {
          .messages-content {
            flex-direction: column;
            height: auto;
          }
          
          .messages-list {
            flex: 0 0 auto;
            max-height: 300px;
            width: 100%;
          }
          
          .message-detail {
            min-height: 400px;
          }
        }
        
        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1.5rem;
          }
          
          .messages-wrapper {
            padding: 1.5rem;
          }
          
          .messages-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .search-container {
            width: 100%;
          }
        }
        
        @media (max-width: 576px) {
          .dashboard-container {
            padding: 1rem;
          }
          
          .messages-wrapper {
            padding: 1rem;
          }
          
          .sender-details {
            grid-template-columns: 1fr;
          }
          
          .action-buttons {
            flex-direction: column;
            width: 100%;
          }
          
          .reply-btn, .delete-btn {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Messages;