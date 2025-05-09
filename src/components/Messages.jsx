import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import { FaEnvelope, FaUser, FaPhone, FaComment, FaTrash, FaReply, FaCalendarAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const { isAuthenticated } = useContext(Context);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(
         // "http://localhost:4000/api/v1/message/getall",
          "https://jainam-hospital-backend.onrender.com/api/v1/message/getall",
          { withCredentials: true }
        );
        setMessages(data.messages);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch messages");
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
       // `http://localhost:4000/api/v1/message/delete/${id}`,
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

  return (
    <div className="messages-container">
      <div className="messages-header">
        <div className="header-content">
          <FaEnvelope className="header-icon" />
          <h1>Patient Messages</h1>
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
              <FaEnvelope className="no-messages-icon" />
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
  );
};

export default Messages;