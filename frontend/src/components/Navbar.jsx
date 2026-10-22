import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/api';
import { Recycle, LogOut, User, PlusCircle, LayoutDashboard } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab, activePortal, setActivePortal }) => {
  const { donor, logoutUser, receiver, logoutReceiver } = useContext(AuthContext);
  const account = activePortal === 'receiver' ? receiver : donor;

  const selectPortal = (portal) => {
    setActivePortal(portal);
    const hasAccount = portal === 'receiver' ? Boolean(receiver) : Boolean(donor);
    setActiveTab(hasAccount ? 'dashboard' : 'login');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      window.alert(error.response?.data?.message || 'Could not confirm server logout. The local session will be cleared.');
    } finally {
      if (activePortal === 'receiver') {
        logoutReceiver();
      } else {
        logoutUser();
      }
      setActiveTab('login');
    }
  };

  return (
    <nav style={{
      background: 'rgba(10, 15, 29, 0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
        padding: '0.9rem 1.5rem',
      }}>
        <div
          role="button"
          tabIndex={0}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          onClick={() => setActiveTab('dashboard')}
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') setActiveTab('dashboard');
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #10b981, #22d3ee)',
            padding: '0.5rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0a0f1d',
          }}>
            <Recycle size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: '#ffffff', lineHeight: '1.2' }}>
              EcoRedistribute <span style={{
                color: '#34d399',
                fontSize: '0.75rem',
                background: 'rgba(16,185,129,0.15)',
                padding: '0.15rem 0.5rem',
                borderRadius: '12px',
                border: '1px solid rgba(16,185,129,0.3)',
                verticalAlign: 'middle',
                marginLeft: '0.3rem',
              }}>Modules 1-4</span>
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Smart donation redistribution platform</p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.55rem',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
        }}>
          <button
            className={activePortal === 'donor' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => selectPortal('donor')}
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
          >
            Donor Portal
          </button>
          <button
            className={activePortal === 'receiver' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => selectPortal('receiver')}
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
          >
            Receiver / NGO Portal
          </button>

          {account ? (
            <>
              {activePortal === 'donor' ? (
                <>
                  <button
                    className={activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setActiveTab('dashboard')}
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </button>
                  <button
                    className={activeTab === 'add' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setActiveTab('add')}
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
                  >
                    <PlusCircle size={16} /> Add Surplus Item
                  </button>
                </>
              ) : (
                <button
                  className="btn-secondary"
                  onClick={() => setActiveTab('dashboard')}
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
                >
                  <LayoutDashboard size={16} /> Donations
                </button>
              )}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255,255,255,0.05)',
                padding: '0.4rem 0.7rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <User size={16} color="#34d399" />
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                  {account.organizationName || account.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                aria-label="Logout"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '0.4rem',
                  display: 'flex',
                  alignItems: 'center',
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
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
              >
                Login
              </button>
              <button
                className={activeTab === 'register' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setActiveTab('register')}
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
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
