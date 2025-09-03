import { API_BASE_URL } from "../api";
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Lottie from 'lottie-react';
import profileAnimation from '../../public/profile-animation.json';
import loadingAnimation from '../../public/loding.json';
import { FiEdit, FiSave, FiMail, FiPhone, FiUser, FiCalendar, FiCreditCard, FiDownload, FiX, FiUpload, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Dynamic profile page for Admin & Doctor without breaking existing Admin UX
const ProfilePage = () => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nic: '',
    dob: '',
    gender: '',
    role: '',
    doctorDepartment: '',
    docAvatar: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const idCardRef = useRef(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null); // Data URL for selected file
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [rawImage, setRawImage] = useState(null); // html img element reference
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [selectedFileName, setSelectedFileName] = useState('avatar.jpg');
  const fileInputRef = useRef(null);
  const [originalData, setOriginalData] = useState(null);
  const [showDetails, setShowDetails] = useState(true);
  
  // Disable page scroll when avatar crop modal open
  useEffect(() => {
    if (showAvatarModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [showAvatarModal]);

  // Fetch logic: try doctor first (faster for doctor sessions), fallback to admin
  useEffect(() => {
    let cancelled = false;
    const fetchProfileData = async () => {
      setLoading(true);
      // Helper to apply data
      const apply = (data) => {
        if (cancelled) { return; }
        setUserData(prev => ({ ...prev, ...data }));
        setLoading(false);
      };
      try {
        // Try doctor endpoint
        const docRes = await axios.get(`${API_BASE_URL}/api/v1/user/doctor/me`, { withCredentials: true });
        apply(docRes.data.user || docRes.data.data || {});
      } catch {
        try {
          const admRes = await axios.get(`${API_BASE_URL}/api/v1/user/admin/me`, { withCredentials: true });
          apply(admRes.data.user || admRes.data.data || {});
        } catch (error) {
          if (!cancelled) {
            toast.error(error.response?.data?.message || 'Error fetching profile data');
            setLoading(false);
          }
        }
      }
    };
    fetchProfileData();
    return () => { cancelled = true; };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const isDoctorRole = userData.role === 'Doctor';
      let payload;
      if (isDoctorRole) {
        // Doctor can only update phone & NIC as per requirement
        payload = { phone: userData.phone, nic: userData.nic };
      } else {
        payload = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          nic: userData.nic,
          dob: userData.dob,
          gender: userData.gender,
          doctorDepartment: userData.doctorDepartment
        };
      }
      const endpoint = isDoctorRole
        ? `${API_BASE_URL}/api/v1/user/doctor/update`
        : `${API_BASE_URL}/api/v1/user/admin/update`;
      await axios.put(endpoint, payload, { withCredentials: true });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating profile');
    }
  };

  const downloadIDCard = async () => {
    setIsGeneratingPDF(true);
    try {
      if (!idCardRef.current) { return; }
      idCardRef.current.style.display = 'block';
      const canvas = await html2canvas(idCardRef.current, { scale: 2, logging: false, useCORS: true, backgroundColor: null, allowTaint: true });
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a5');
      const imgWidth = 148;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${userData.firstName}_${userData.lastName}_ID_Card.pdf`);
    } catch (error) {
      toast.error('Failed to generate ID card');
      console.error('Error generating ID card:', error);
    } finally {
      if (idCardRef.current) { idCardRef.current.style.display = 'none'; }
      setIsGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', overflow: 'hidden' }}>
        <Lottie animationData={loadingAnimation} style={{ height: 220, width: 220, overflow: 'hidden' }} />
        <p style={{ color: '#fff', marginTop: '1rem', fontFamily: 'Inter, sans-serif', letterSpacing: '.5px' }}>Loading profile...</p>
      </div>
    );
  }

  const isDoctor = userData.role === 'Doctor';
  const canEditField = (field) => {
    if (!isDoctor) { return true; } // Admin (or other) can edit everything
    return ['phone', 'nic'].includes(field); // Doctor limited fields
  };

  const getDepartmentQuote = (dept) => {
    if (!dept) {
      return [
        'Compassion in every action,',
        'clarity in every decision,',
        'teamwork in every challenge,',
        'innovation with responsibility,',
        'focus on patient dignity,',
        'care that always listens.'
      ];
    }
    const key = dept.toLowerCase();
    if (key.includes('card')) {
      return [
        'Every heartbeat is a story,',
        'every rhythm tells a truth.',
        'We listen beyond the monitor,',
        'treat beyond the symptom,',
        'guard the pulse of life,',
        'and restore quiet strength.'
      ];
    }
    if (key.includes('pedia')) {
      return [
        'Small hands, big courage,',
        'quiet fears, bright hope.',
        'We heal with softness,',
        'we speak in patience,',
        'we protect childhood,',
        'as futures take root.'
      ];
    }
    if (key.includes('neuro')) {
      return [
        'Within silent pathways,',
        'signals search for light.',
        'We map the unseen,',
        'restore lost whispers,',
        'bridge fractured circuits,',
        'and return the self.'
      ];
    }
    if (key.includes('ortho')) {
      return [
        'Motion defines living,',
        'strength is re-learned,',
        'precision builds stability,',
        'alignment renews purpose,',
        'resilience finds balance,',
        'and steps become victory.'
      ];
    }
    if (key.includes('onco')) {
      return [
        'In the marathon of healing,',
        'courage walks beside risk.',
        'Data shapes direction,',
        'empathy steadies nights,',
        'hope breathes between cycles,',
        'and outcomes redefine strength.'
      ];
    }
    if (key.includes('emerg')) {
      return [
        'When seconds sharpen focus,',
        'clarity outruns fear.',
        'Calm builds structure,',
        'skill bends chaos,',
        'teams move like instinct,',
        'and life reclaims its edge.'
      ];
    }
    return [
      'Care with precision,',
      'listen without hurry,',
      'treat the whole human,',
      'balance science and warmth,',
      'learn from each moment,',
      'leave quiet impact.'
    ];
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="welcome-content">
          <h1>WELCOME {userData.firstName?.toUpperCase()} {userData.lastName?.toUpperCase()}</h1>
          <div className="profile-animation">
            <Lottie animationData={profileAnimation} loop={true} />
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <button
            className="toggle-details-btn"
            onClick={() => { setShowDetails(prev => { const next = !prev; if (!next) { setIsEditing(false); } return next; }); }}
            aria-label={showDetails ? 'Collapse details' : 'Expand details'}
          >
            {showDetails ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          <div className={`avatar-section ${showDetails ? '' : 'collapsed'}`}>
            {isDoctor && userData.docAvatar?.url ? (
              <img
                src={userData.docAvatar.url}
                alt="Doctor Avatar"
                className="avatar-img avatar-clickable"
                onClick={() => setShowAvatarModal(true)}
                title="View & Edit Avatar"
              />
            ) : (
              <div
                className="avatar avatar-clickable"
                onClick={() => isDoctor && setShowAvatarModal(true)}
                title={isDoctor ? 'Add Avatar' : ''}
              >
                {userData.firstName?.charAt(0).toUpperCase()}{userData.lastName?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="user-meta">
              <h2>{userData.firstName} {userData.lastName}</h2>
              <span className="role-badge">{userData.role || 'User'}</span>
              {isDoctor && userData.doctorDepartment && (
                <span className="dept-badge">{userData.doctorDepartment}</span>
              )}
              {!showDetails && (
                <div className="collapsed-inline-list">
                  {userData.phone && (
                    <div className="collapsed-item">
                      <FiPhone /> <span>{userData.phone}</span>
                    </div>
                  )}
                  {userData.email && (
                    <div className="collapsed-item">
                      <FiMail /> <span className="truncate" title={userData.email}>{userData.email}</span>
                    </div>
                  )}
                  {userData.nic && (
                    <div className="collapsed-item">
                      <FiCreditCard /> <span>{userData.nic}</span>
                    </div>
                  )}
                  {isDoctor && userData.doctorDepartment && (
                    <div className="collapsed-item dept">
                      <FiUser /> <span>{userData.doctorDepartment}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            {!showDetails && (
              <div className="collapsed-quote-box">
                {getDepartmentQuote(userData.doctorDepartment).map((line, idx) => (
                  <div key={idx} className="quote-line">{line}</div>
                ))}
              </div>
            )}
          </div>
          {showDetails && (
          <>
          <div className="profile-details">
            <div className="detail-group">
              <h3><FiUser className="icon" /> Personal Information</h3>
              <div className="detail-row">
                <label>Full Name</label>
                {isEditing && canEditField('firstName') && canEditField('lastName') ? (
                  <div className="name-inputs">
                    <input type="text" name="firstName" value={userData.firstName} onChange={handleInputChange} placeholder="First Name" />
                    <input type="text" name="lastName" value={userData.lastName} onChange={handleInputChange} placeholder="Last Name" />
                  </div>
                ) : (
                  <p>{userData.firstName} {userData.lastName}</p>
                )}
              </div>

              <div className="detail-row">
                <label><FiMail className="icon" /> Email Address</label>
                {isEditing && canEditField('email') ? (
                  <input type="email" name="email" value={userData.email} onChange={handleInputChange} placeholder="Email" />
                ) : (
                  <p>{userData.email}</p>
                )}
              </div>

              <div className="detail-row">
                <label><FiPhone className="icon" /> Phone Number</label>
                {isEditing && canEditField('phone') ? (
                  <input type="tel" name="phone" value={userData.phone} onChange={handleInputChange} placeholder="Phone" />
                ) : (
                  <p>{userData.phone}</p>
                )}
              </div>
            </div>

            <div className="detail-group">
              <h3><FiCreditCard className="icon" /> Additional Information</h3>
              <div className="detail-row">
                <label>NIC Number</label>
                {isEditing && canEditField('nic') ? (
                  <input type="text" name="nic" value={userData.nic} onChange={handleInputChange} placeholder="NIC" />
                ) : (
                  <p>{userData.nic}</p>
                )}
              </div>

              <div className="detail-row">
                <label><FiCalendar className="icon" /> Date of Birth</label>
                {isEditing && canEditField('dob') ? (
                  <input type="date" name="dob" value={userData.dob ? userData.dob.split('T')[0] : ''} onChange={handleInputChange} />
                ) : (
                  <p>{userData.dob ? new Date(userData.dob).toLocaleDateString() : '—'}</p>
                )}
              </div>

              <div className="detail-row">
                <label>Gender</label>
                {isEditing && canEditField('gender') ? (
                  <select name="gender" value={userData.gender} onChange={handleInputChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p>{userData.gender}</p>
                )}
              </div>

              {isDoctor && (
                <div className="detail-row">
                  <label>Department</label>
                  {isEditing && !isDoctor ? (
                    <input type="text" name="doctorDepartment" value={userData.doctorDepartment || ''} onChange={handleInputChange} placeholder="Department" />
                  ) : (
                    <p>{userData.doctorDepartment || '—'}</p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="action-buttons1">
            {isEditing ? (
              <>
                <button className="save-btn" onClick={handleSave} disabled={isGeneratingPDF}>
                  <FiSave /> Save Changes
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => {
                    if (originalData) { setUserData(originalData); }
                    setIsEditing(false);
                    setOriginalData(null);
                  }}
                  disabled={isGeneratingPDF}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button className="edit-btn" onClick={() => { setOriginalData(userData); setIsEditing(true); }}>
                  <FiEdit /> {isDoctor ? 'Edit Contact Info' : 'Edit Profile'}
                </button>
                <button className="download-btn" onClick={downloadIDCard} disabled={isGeneratingPDF}>
                  <FiDownload /> {isGeneratingPDF ? 'Generating...' : 'Download ID Card'}
                </button>
              </>
            )}
          </div>
          </>
          )}
        </div>
      </div>

      {/* Hidden ID Card for PDF generation */}
      <div id="id-card" ref={idCardRef} className="hidden-id-card">
        <div className="id-card-header">
          <h2>Jainam Hospital</h2>
          <p>Staff Identification Card</p>
        </div>
        <div className="id-card-body">
          {isDoctor && userData.docAvatar?.url ? (
            <img src={userData.docAvatar.url} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginRight: '1rem' }} />
          ) : (
            <div className="id-card-avatar">{userData.firstName?.charAt(0).toUpperCase()}{userData.lastName?.charAt(0).toUpperCase()}</div>
          )}
          <div className="id-card-user-info">
            <h3>{userData.firstName} {userData.lastName}</h3>
            <p>{isDoctor ? `${userData.role} • ${userData.doctorDepartment}` : userData.role}</p>
          </div>
        </div>
        <div className="id-card-details">
          <div className="id-card-row"><span>Employee ID:</span><span>{userData._id?.substring(0, 8).toUpperCase()}</span></div>
          <div className="id-card-row"><span>Phone:</span><span>{userData.phone}</span></div>
          {isDoctor && <div className="id-card-row"><span>Dept:</span><span>{userData.doctorDepartment}</span></div>}
          <div className="id-card-row"><span>Valid Until:</span><span>{new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toLocaleDateString()}</span></div>
        </div>
        <div className="id-card-footer"><p>This card is property of Jainam Hospital. If found, please return to the administration office.</p></div>
        <div className="id-card-signature"><div className="signature-line"></div><div className="signature-name">Mr.AAYUSH JAIN</div></div>
      </div>

      <style jsx="true">{`
        .avatar-img {width:120px;height:120px;border-radius:50%;object-fit:cover;box-shadow:0 0 0 4px #16213e,0 0 0 6px #4f46e5;margin-bottom:1rem;}
  .avatar-clickable {cursor:pointer;position:relative;}
        .dept-badge {display:inline-block;margin-top:.5rem;background:#0f3460;color:#74c0fc;padding:.25rem .65rem;border-radius:14px;font-size:.65rem;letter-spacing:.5px;font-weight:600;}
        /* (Retained existing styles from previous version) */
        .profile-container {background-color:#1a1a2e;color:#e9ecef;min-height:100vh;padding:2rem;margin-left:270px;transition:margin-left .3s ease;}
        .profile-header {display:flex;justify-content:center;margin-bottom:2rem;}
        .welcome-content {display:flex;flex-direction:column;align-items:center;text-align:center;width:100%;}
        .welcome-content h1 {color:#fff;font-size:2rem;margin-bottom:1.5rem;}
        .profile-animation {width:200px;height:200px;}
        .profile-content {max-width:1200px;margin:0 auto;}
        .profile-card {background:#16213e;border-radius:10px;padding:2rem;border:1px solid #2d3748;}
  .toggle-details-btn {position:absolute;top:14px;right:14px;background:#0f3460;border:1px solid #24385c;color:#fff;width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1.15rem;transition:.25s;box-shadow:0 4px 14px -4px rgba(0,0,0,.5);} 
  .toggle-details-btn:hover {background:#4f46e5;border-color:#4f46e5;}
  .profile-card {position:relative;}
  .avatar-section {display:flex;flex-direction:column;align-items:center;margin-bottom:2rem;transition:.25s;}
  .avatar-section.collapsed {flex-direction:row;align-items:center;justify-content:flex-start;gap:1.5rem;}
  .avatar-section.collapsed .user-meta {text-align:left;display:flex;flex-direction:column;align-items:flex-start;}
  .avatar-section.collapsed .user-meta h2 {text-align:left;}
  .avatar-section.collapsed .collapsed-extra {align-items:flex-start;}
        .avatar {width:100px;height:100px;border-radius:50%;background:#4f46e5;color:#fff;display:flex;justify-content:center;align-items:center;font-size:2rem;font-weight:700;margin-bottom:1rem;}
        .user-meta h2 {font-size:1.5rem;color:#fff;margin-bottom:.5rem;text-align:center;}
        .role-badge {display:inline-block;padding:.25rem .75rem;background:#8b5cf6;color:#fff;border-radius:20px;font-size:.8rem;font-weight:500;}
  .collapsed-extra {display:none;}
    .collapsed-inline-list {margin-top:.6rem;display:flex;flex-wrap:wrap;gap:.65rem;justify-content:flex-start;max-width:640px;overflow:hidden;}
  .collapsed-item {display:inline-flex;align-items:center;gap:.5rem;font-size:.8rem;line-height:1;color:#e2e8f0;background:#0f3460;padding:.6rem .95rem;border-radius:11px;font-weight:600;letter-spacing:.4px;border:1px solid #1f3a60;box-shadow:0 4px 10px -4px rgba(0,0,0,.55);max-width:100%;overflow:hidden;position:relative;}
  .collapsed-item span {display:inline-block;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .collapsed-item.dept {background:#4f46e5;border-color:#4f46e5;color:#fff;}
  .collapsed-item .truncate {max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block;}
  .collapsed-quote-box {margin-left:2rem;background:linear-gradient(160deg,#0f3460 0%,#16213e 70%);border:1px solid #273e63;padding:1.25rem 1.4rem 1.35rem 1.55rem;border-radius:18px;display:flex;flex-direction:column;justify-content:center;min-width:300px;max-width:340px;box-shadow:0 10px 28px -10px rgba(0,0,0,.7),0 0 0 1px rgba(79,70,229,.25);position:relative;overflow:hidden;font-family:'Segoe UI','Inter','Roboto','Helvetica Neue',Arial,sans-serif;}
  .collapsed-quote-box:before {content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 88% 12%,rgba(99,102,241,0.35),transparent 58%),linear-gradient(120deg,rgba(99,102,241,0.15),transparent 60%);} 
  .collapsed-quote-box:after {content:"";position:absolute;left:14px;top:50%;transform:translateY(-50%);width:4px;height:70%;background:linear-gradient(#6366f1,#8b5cf6);border-radius:3px;box-shadow:0 0 0 1px rgba(255,255,255,0.08);} 
  .quote-line {font-size:.7rem;letter-spacing:.9px;color:#f1f5f9;font-weight:500;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-style:italic;}
  .quote-line + .quote-line {margin-top:.4rem;}
  @media (max-width:860px){.collapsed-quote-box{display:none;} .collapsed-inline-list{max-width:100%;}}
  @media (max-width:620px){.collapsed-inline-list{flex-direction:column;align-items:flex-start;} .collapsed-item{font-size:.75rem;width:100%;}} 
        .profile-details {display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:2rem;}
        .detail-group h3 {font-size:1.05rem;color:#4f46e5;margin-bottom:1.2rem;padding-bottom:.5rem;border-bottom:1px solid #2d3748;display:flex;align-items:center;}
        .detail-group h3 .icon {margin-right:.5rem;}
        .detail-row {margin-bottom:1.2rem;}
        .detail-row label {display:block;font-size:.75rem;color:#adb5bd;margin-bottom:.45rem;letter-spacing:.5px;font-weight:500;text-transform:uppercase;display:flex;align-items:center;gap:.4rem;}
  .detail-row p {font-size:.95rem;color:#fff;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;}
  .detail-row {overflow:hidden;}
  .detail-row input,.detail-row select {text-overflow:ellipsis;}
        .name-inputs {display:grid;grid-template-columns:1fr 1fr;gap:1rem;}
        input,select {width:100%;padding:.7rem .9rem;background:#0f3460;border:1px solid #3a4a6b;border-radius:6px;color:#fff;font-size:.85rem;}
        input:focus,select:focus {outline:none;border-color:#4f46e5;box-shadow:0 0 0 2px rgba(79,70,229,0.25);}
        select {appearance:none;background-image:url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%23e9ecef' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' viewBox='0 0 24 24'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e");background-repeat:no-repeat;background-position:right .8rem center;background-size:14px;}
        .action-buttons1 {display:flex;gap:1rem;margin-top:2rem;padding-top:2rem;border-top:1px solid #2d3748;justify-content:center;flex-wrap:wrap;}
  .edit-btn,.download-btn,.save-btn,.cancel-btn {display:inline-flex;align-items:center;gap:.5rem;background:#4f46e5;color:#fff;padding:.75rem 1.4rem;border-radius:8px;font-size:.8rem;font-weight:600;letter-spacing:.5px;border:none;cursor:pointer;transition:.25s;}
        .edit-btn:hover {background:#4338ca;}
        .save-btn {background:#10b981;} .save-btn:hover {background:#059669;}
        .download-btn {background:#8b5cf6;} .download-btn:hover {background:#7c3aed;} .download-btn:disabled {opacity:.7;cursor:not-allowed;}
  .cancel-btn {background:#374151;} .cancel-btn:hover {background:#4b5563;}
        .hidden-id-card {background:#16213e;border-radius:10px;padding:1.5rem;width:350px;border:2px solid #4f46e5;display:none;position:fixed;top:-1000px;left:-1000px;color:#e9ecef;}
        .id-card-header {text-align:center;border-bottom:2px solid #4f46e5;padding-bottom:1rem;margin-bottom:1.2rem;}
        .id-card-header h2 {color:#4f46e5;margin:0 0 .4rem;}
        .id-card-body {display:flex;align-items:center;margin-bottom:1.3rem;}
        .id-card-avatar {width:80px;height:80px;background:#4f46e5;border-radius:50%;display:flex;justify-content:center;align-items:center;color:#fff;font-size:1.5rem;font-weight:700;margin-right:1rem;}
        .id-card-user-info h3 {margin:0;color:#fff;font-size:1rem;}
        .id-card-user-info p {margin:.25rem 0 0;color:#adb5bd;font-size:.7rem;letter-spacing:.5px;}
        .id-card-details {margin-bottom:1.1rem;}
        .id-card-row {display:flex;justify-content:space-between;margin-bottom:.45rem;font-size:.65rem;letter-spacing:.4px;}
        .id-card-row span:first-child {color:#adb5bd;}
        .id-card-footer {background:#0f3460;padding:.55rem;border-radius:6px;margin-bottom:1.1rem;}
        .id-card-footer p {margin:0;color:#fff;font-size:.55rem;text-align:center;line-height:1.2;}
        .id-card-signature {display:flex;justify-content:space-between;align-items:flex-end;}
        .signature-line {width:100px;height:2px;background:#4f46e5;margin-bottom:.5rem;}
        .signature-name {background:#4f46e5;color:#fff;padding:.25rem .6rem;border-radius:4px;font-size:.55rem;font-weight:600;letter-spacing:.5px;}
        /* Avatar Modal */
        .avatar-modal-overlay {position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:1000;background:rgba(10,15,30,0.55);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);animation:fadeIn .25s ease;}
        .avatar-modal {background:#16213e;border:1px solid #2d3748;border-radius:18px;padding:1.8rem 2rem;position:relative;max-width:480px;width:100%;box-shadow:0 10px 40px -10px rgba(0,0,0,.6);display:flex;flex-direction:column;align-items:center;}
        .avatar-modal h3 {margin:0 0 1.2rem;font-size:1.05rem;letter-spacing:.5px;color:#fff;display:flex;align-items:center;gap:.6rem;}
        .close-modal-btn {position:absolute;top:10px;right:10px;background:#0f3460;border:1px solid #24385c;color:#fff;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.25s;font-size:1.1rem;}
        .close-modal-btn:hover {background:#4f46e5;border-color:#4f46e5;}
        .avatar-large-wrapper {position:relative;margin:0 0 1.4rem;}
        .avatar-large {width:240px;height:240px;border-radius:24px;object-fit:cover;box-shadow:0 0 0 5px #0f1c33,0 0 0 8px #4f46e5;background:#0f3460;display:flex;align-items:center;justify-content:center;font-size:4rem;font-weight:700;color:#fff;letter-spacing:2px;}
        .change-avatar-btn {position:absolute;bottom:14px;right:14px;background:#4f46e5;border:none;color:#fff;padding:.65rem .85rem;border-radius:14px;display:inline-flex;align-items:center;gap:.45rem;font-size:.7rem;font-weight:600;cursor:pointer;letter-spacing:.5px;box-shadow:0 4px 14px -3px rgba(79,70,229,.55);transition:.25s;}
        .change-avatar-btn:hover {background:#4338ca;}
        .uploading-indicator {margin-top:.5rem;font-size:.7rem;color:#a5b4fc;letter-spacing:.5px;display:flex;align-items:center;gap:.5rem;}
        .modal-actions {display:flex;gap:1rem;margin-top:.8rem;}
        .modal-actions button {flex:1;display:inline-flex;align-items:center;justify-content:center;gap:.5rem;background:#10b981;color:#fff;border:none;padding:.75rem 1.1rem;border-radius:10px;font-size:.75rem;font-weight:600;cursor:pointer;letter-spacing:.5px;transition:.25s;}
        .modal-actions button.secondary {background:#0f3460;color:#fff;border:1px solid #2d4a70;}
        .modal-actions button.secondary:hover {background:#1d4d85;}
        .modal-actions button:hover {background:#059669;}
        @keyframes fadeIn {from {opacity:0;} to {opacity:1;}}
        @media (max-width:520px){.avatar-modal{margin:0 1rem;padding:1.5rem;} .avatar-large{width:200px;height:200px;} }
        @media (max-width:1200px){.profile-container{margin-left:0;}}
        @media (max-width:768px){.profile-container{padding:1.4rem;} .welcome-content h1{font-size:1.55rem;} .profile-animation{width:160px;height:160px;} .profile-card{padding:1.5rem;} .action-buttons1{flex-direction:column;}}
        @media (max-width:480px){.profile-container{padding:1rem;} .profile-details{grid-template-columns:1fr;} .name-inputs{grid-template-columns:1fr;} .welcome-content h1{font-size:1.25rem;margin-top:10px;} .profile-animation{width:120px;height:120px;} .avatar{width:80px;height:80px;font-size:1.5rem;} .avatar-img{width:90px;height:90px;}}
  /* Hide scrollbars & overflow while cropping */
  body.modal-open { overflow:hidden !important; }
  .avatar-modal-overlay {overflow:hidden;}
  .avatar-modal {overflow:hidden;}
  .avatar-modal-overlay * {scrollbar-width:none;}
  .avatar-modal-overlay *::-webkit-scrollbar {display:none;}
  .crop-wrapper {max-width:100%;overflow:hidden;}
      `}</style>

      {showAvatarModal && (
  <div className="avatar-modal-overlay" /* Outside click disabled to force explicit action */>
          <div className="avatar-modal" role="dialog" aria-modal="true">
            <h3><FiUser /> {userData.firstName} {userData.lastName} Avatar</h3>
            <div className="avatar-large-wrapper crop-wrapper">
              {avatarPreview ? (
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  circularCrop={false}
                  aspect={1}
                  minWidth={40}
                >
                  <img
                    ref={img => setRawImage(img)}
                    src={avatarPreview}
                    alt="Selected"
                    style={{ maxHeight: 320, maxWidth: '100%', objectFit: 'contain' }}
                    onLoad={(e) => {
                      const { width, height } = e.currentTarget;
                      const side = Math.min(width, height) * 0.8;
                      const init = centerCrop(
                        makeAspectCrop({ unit: '%', width: 80 }, 1, width, height),
                        width,
                        height
                      );
                      setCrop(init);
                    }}
                  />
                </ReactCrop>
              ) : (
                <div className="avatar-large no-image">
                  {isDoctor && userData.docAvatar?.url ? (
                    <img src={userData.docAvatar.url} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '24px', objectFit: 'cover' }} />
                  ) : (
                    <span>{userData.firstName?.charAt(0).toUpperCase()}{userData.lastName?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              )}
              {isDoctor && (
                <button className="change-avatar-btn" onClick={() => fileInputRef.current?.click()} disabled={isUploadingAvatar}>
                  <FiUpload /> {avatarPreview ? 'Change Image' : (userData.docAvatar?.url ? 'Change' : 'Upload')}
                </button>
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) {
                    return;
                  }
                  setSelectedFileName(file.name || 'avatar.jpg');
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setAvatarPreview(ev.target.result);
                    setCrop(undefined);
                    setCompletedCrop(undefined);
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </div>
            {isUploadingAvatar && <div className="uploading-indicator">Uploading...</div>}
            <div className="modal-actions crop-actions">
              <button
                className="secondary"
                onClick={() => {
                  setAvatarPreview(null);
                  setCrop(undefined);
                  setCompletedCrop(undefined);
                  setShowAvatarModal(false);
                }}
                disabled={isUploadingAvatar}
              ><FiX /> Cancel</button>
              <button
                onClick={async () => {
                  if (!rawImage || !completedCrop?.width || !completedCrop?.height) {
                    toast.error('Select & crop an image first');
                    return;
                  }
                  setIsUploadingAvatar(true);
                  try {
                    // Create canvas for cropped area
                    const canvas = document.createElement('canvas');
                    const scaleX = rawImage.naturalWidth / rawImage.width;
                    const scaleY = rawImage.naturalHeight / rawImage.height;
                    canvas.width = Math.round(completedCrop.width * scaleX);
                    canvas.height = Math.round(completedCrop.height * scaleY);
                    const ctx = canvas.getContext('2d');
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(
                      rawImage,
                      completedCrop.x * scaleX,
                      completedCrop.y * scaleY,
                      completedCrop.width * scaleX,
                      completedCrop.height * scaleY,
                      0,
                      0,
                      canvas.width,
                      canvas.height
                    );
                    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92));
                    if (!blob) {
                      throw new Error('Failed to process image');
                    }
                    const file = new File([blob], selectedFileName.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
                    const formData = new FormData();
                    formData.append('docAvatar', file);
                    const endpoint = `${API_BASE_URL}/api/v1/user/doctor/update`;
                    await axios.put(endpoint, formData, { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } });
                    toast.success('Avatar updated');
                    try {
                      const docRes = await axios.get(`${API_BASE_URL}/api/v1/user/doctor/me`, { withCredentials: true });
                      const fresh = docRes.data.user || docRes.data.data || {};
                      setUserData(prev => ({ ...prev, docAvatar: fresh.docAvatar }));
                    } catch {}
                    setShowAvatarModal(false);
                    setAvatarPreview(null);
                  } catch (err) {
                    toast.error(err.response?.data?.message || 'Upload failed');
                  } finally {
                    setIsUploadingAvatar(false);
                  }
                }}
                disabled={isUploadingAvatar || !avatarPreview}
              ><FiSave /> Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
