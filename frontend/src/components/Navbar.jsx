import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Sparkles, Recycle, LogOut, User, PlusCircle, LayoutDashboard } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { donor, logoutUser } = useContext(AuthContext);

  return (
    <nav style={{
      background: 'rgba(10, 15, 29, 0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.5rem' }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
          <div style={{
            background: 'linear-gradient(135deg, #10b981, #22d3ee)',
            padding: '0.5rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0a0f1d'
          }}>
            <Recycle size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#ffffff', lineHeight: '1.2' }}>
              EcoRedistribute <span style={{ color: '#34d399', fontSize: '0.8rem', background: 'rgba(16,185,129,0.15)', padding: '0.15rem 0.5rem', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.3)', verticalAlign: 'middle', marginLeft: '0.4rem' }}>Module 1</span>
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>AI Surplus Item Analysis Engine</p>
          </div>
        </div>

        {/* Action Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {donor ? (
            <>
              <button 
                className={activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setActiveTab('dashboard')}
                style={{ padding: '0.5rem 1rem', fontSize: '0.88rem' }}
              >
                <LayoutDashboard size={16} /> Dashboard
              </button>

              <button 
                className={activeTab === 'add' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setActiveTab('add')}
                style={{ padding: '0.5rem 1rem', fontSize: '0.88rem' }}
              >
                <PlusCircle size={16} /> Add Surplus Item
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <User size={16} color="#34d399" />
                <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{donor.name}</span>
              </div>

              <button 
                onClick={logoutUser}
                title="Logout"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '0.4rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <button 
                className={activeTab === 'login' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setActiveTab('login')}
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.88rem' }}
              >
                Login
              </button>

              <button 
                className={activeTab === 'register' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setActiveTab('register')}
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.88rem' }}
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
