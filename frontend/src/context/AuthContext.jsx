import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedDonor = localStorage.getItem('donor');
    if (savedDonor) {
      try {
        setDonor(JSON.parse(savedDonor));
      } catch (e) {
        localStorage.removeItem('donor');
      }
    }
    setLoading(false);
  }, []);

  const loginUser = (donorData) => {
    setDonor(donorData);
    localStorage.setItem('donor', JSON.stringify(donorData));
  };

  const logoutUser = () => {
    setDonor(null);
    localStorage.removeItem('donor');
  };

  return (
    <AuthContext.Provider value={{ donor, loginUser, logoutUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
