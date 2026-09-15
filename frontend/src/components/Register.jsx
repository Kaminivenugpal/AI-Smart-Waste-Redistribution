import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/api';
import { UserPlus, User, Mail, Lock, Phone, MapPin, AlertCircle, ArrowRight } from 'lucide-react';

const Register = ({ setActiveTab }) => {
  const { loginUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password || !formData.location) {
      setError('Please fill in all required fields (Name, Email, Password, Location).');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register(formData);
      if (response.success && response.donor) {
        loginUser(response.donor);
        setActiveTab('dashboard');
      } else {
        setError(response.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect to backend server. Ensure Spring Boot is running on port 8080.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '3rem auto' }} className="animate-fade-in">
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
            <UserPlus size={26} />
          </div>
          <h2 style={{ fontSize: '1.5rem', color: '#ffffff' }}>Create Donor Account</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: '0.3rem' }}>
            Join the AI Waste Redistribution Platform
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
            <label>Full Name *</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text"
                name="name"
                className="form-control"
                placeholder="e.g. Shalini V"
                value={formData.name}
                onChange={handleChange}
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                required
              />
              <User size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email"
                name="email"
                className="form-control"
                placeholder="shalini@example.com"
                value={formData.email}
                onChange={handleChange}
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                required
              />
              <Mail size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            </div>
          </div>

          <div className="form-group">
            <label>Password *</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password"
                name="password"
                className="form-control"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                required
              />
              <Lock size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text"
                  name="phone"
                  className="form-control"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                />
                <Phone size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              </div>
            </div>

            <div className="form-group">
              <label>Location / City *</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text"
                  name="location"
                  className="form-control"
                  placeholder="Bangalore, KA"
                  value={formData.location}
                  onChange={handleChange}
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  required
                />
                <MapPin size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Creating Account...' : (
              <>Complete Registration <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.8rem', fontSize: '0.88rem', color: '#9ca3af' }}>
          Already registered?{' '}
          <button 
            onClick={() => setActiveTab('login')}
            style={{ background: 'none', border: 'none', color: '#34d399', fontWeight: 600, cursor: 'pointer' }}
          >
            Sign In Here
          </button>
        </div>

      </div>
    </div>
  );
};

export default Register;
