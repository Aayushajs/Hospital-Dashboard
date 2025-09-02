import React from 'react';
import Lottie from 'lottie-react';
import noInternetAnimation from '../../public/no-internet.json';

const OfflineAnimation = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="offline-container overflow-hidden">
      <Lottie animationData={noInternetAnimation} loop={true} style={{ width: 300, height: 300 , overflow: "hidden" }} />
      <p>No Internet Connection</p>
      <span>Please check your connection and try again.</span>
      <button onClick={handleReload} className="reload-button">
        Try Again
      </button>
    </div>
  );
};

export default OfflineAnimation;
