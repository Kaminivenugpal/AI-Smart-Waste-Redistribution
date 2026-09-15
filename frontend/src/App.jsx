import React, { useState, useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import DonorDashboard from './components/DonorDashboard';
import AddItemForm from './components/AddItemForm';
import AnalysisResultCard from './components/AnalysisResultCard';

const MainContent = () => {
  const { donor, loading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedAnalysisResult, setSelectedAnalysisResult] = useState(null);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: '#9ca3af' }}>
        Loading EcoRedistribute Platform...
      </div>
    );
  }

  const handleAnalysisComplete = (resultData) => {
    setSelectedAnalysisResult(resultData);
    setActiveTab('result');
  };

  const handleViewResult = (resultData) => {
    setSelectedAnalysisResult(resultData);
    setActiveTab('result');
  };

  // Render view based on authentication & active tab
  const renderTabContent = () => {
    if (!donor) {
      if (activeTab === 'register') {
        return <Register setActiveTab={setActiveTab} />;
      }
      return <Login setActiveTab={setActiveTab} />;
    }

    switch (activeTab) {
      case 'add':
        return <AddItemForm onAnalysisComplete={handleAnalysisComplete} />;

      case 'result':
        return (
          <AnalysisResultCard 
            resultData={selectedAnalysisResult} 
            onDone={() => setActiveTab('dashboard')} 
            onAddAnother={() => setActiveTab('add')}
          />
        );

      case 'dashboard':
      default:
        return (
          <DonorDashboard 
            onNavigateToAdd={() => setActiveTab('add')} 
            onViewResult={handleViewResult}
          />
        );
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main style={{ flex: 1, padding: '1rem 0' }}>
        {renderTabContent()}
      </main>
      <footer style={{
        textAlign: 'center',
        padding: '1.5rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        color: '#6b7280',
        fontSize: '0.85rem'
      }}>
        AI Smart Waste Redistribution Platform • Module 1 (AI Surplus Item Analysis Engine)
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;
