import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [donor, setDonor] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore donor from localStorage
    const savedDonor = localStorage.getItem('donor');
    if (savedDonor) {
      try {
        setDonor(JSON.parse(savedDonor));
      } catch (e) {
        localStorage.removeItem('donor');
      }
    }

    // Restore receiver from localStorage
    const savedReceiver = localStorage.getItem('receiver');
    if (savedReceiver) {
      try {
        setReceiver(JSON.parse(savedReceiver));
      } catch (e) {
        localStorage.removeItem('receiver');
      }
    }

    setLoading(false);
  }, []);

  // loginUser now accepts (donorData, token) — stores token inside the object
  // so the Axios interceptor can read donor?.token from localStorage
  const loginUser = (donorData, token) => {
    const payload = token ? { ...donorData, token } : donorData;
    setDonor(payload);
    setReceiver(null);
    localStorage.removeItem('receiver');
    localStorage.setItem('donor', JSON.stringify(payload));
  };

  const logoutUser = () => {
    setDonor(null);
    setReceiver(null);
    localStorage.removeItem('donor');
    // Clean up receiver as well on full logout
    localStorage.removeItem('receiver');
  };

  const loginReceiver = (receiverData, token) => {
    const payload = token ? { ...receiverData, token } : receiverData;
    setDonor(null);
    localStorage.removeItem('donor');
    setReceiver(payload);
    localStorage.setItem('receiver', JSON.stringify(payload));
  };

  const logoutReceiver = () => {
    setReceiver(null);
    localStorage.removeItem('receiver');
  };

  return (
    <AuthContext.Provider value={{ donor, loginUser, logoutUser, receiver, loginReceiver, logoutReceiver, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
