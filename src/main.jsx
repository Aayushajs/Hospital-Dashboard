import React, { createContext, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { registerSW } from 'virtual:pwa-register';

export const Context = createContext({ 
  isAuthenticated: false,
  isDoctorAuthenticated: false 
});

const AppWrapper = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDoctorAuthenticated, setIsDoctorAuthenticated] = useState(false);
  const [admin, setAdmin] = useState({});
  const [doctor, setDoctor] = useState({});

  return (
    <Context.Provider
      value={{ 
        isAuthenticated, 
        setIsAuthenticated, 
        admin, 
        setAdmin,
        isDoctorAuthenticated,
        setIsDoctorAuthenticated,
        doctor,
        setDoctor
      }}
    >
      <App />
    </Context.Provider>
  );
};

// Register the service worker
registerSW({ onNeedRefresh: () => {}, onOfflineReady: () => {} });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);