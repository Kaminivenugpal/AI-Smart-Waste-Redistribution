import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/api';
import { LogIn, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Login = ({ setActiveTab }) => {
  const { loginUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      if (response.success && response.donor) {
        loginUser(response.donor);
        setActiveTab('dashboard');
      } else {
        setError(response.message || 'Login failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect to backend server. Make sure Spring Boot is running on port 8080.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '4rem auto' }} className="animate-fade-in">
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            width: '54px', 
            height: '54px', 
            background: 'rgba(16, 185, 129, 0.15)', 
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1rem auto',
            color: '#34d399'
          }}>
            <LogIn size={26} />
          </div>
          <h2 style={{ fontSize: '1.5rem', color: '#ffffff' }}>Donor Portal Login</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: '0.3rem' }}>
            Access your surplus redistribution dashboard
          </p>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.15)', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            color: '#fca5a5', 
            padding: '0.8rem 1rem', 
            borderRadius: '10px', 
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email"
                className="form-control"
                placeholder="donor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                required
              />
              <Mail size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.8rem' }}>
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                required
              />
              <Lock size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ width: '100%', padding: '0.85rem' }}
          >
            {loading ? 'Authenticating...' : (
              <>Sign In <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.8rem', fontSize: '0.88rem', color: '#9ca3af' }}>
          Don't have a donor account?{' '}
          <button 
            onClick={() => setActiveTab('register')}
            style={{ background: 'none', border: 'none', color: '#34d399', fontWeight: 600, cursor: 'pointer' }}
          >
            Register Now
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;
