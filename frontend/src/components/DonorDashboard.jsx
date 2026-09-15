import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { itemService } from '../services/api';
import { 
  Package, PlusCircle, Sparkles, Activity, Layers, 
  MapPin, Clock, CheckCircle2, ShieldCheck, RefreshCw 
} from 'lucide-react';

const DonorDashboard = ({ onNavigateToAdd, onViewResult }) => {
  const { donor } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDonorItems = async () => {
    if (!donor?.id) return;
    setLoading(true);
    setError('');
    try {
      const data = await itemService.getDonorItems(donor.id);
      setItems(data || []);
    } catch (err) {
      setError('Could not fetch surplus items. Check if backend Spring Boot server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonorItems();
  }, [donor?.id]);

  const highPriorityCount = items.filter(i => i.analysisResult?.priority === 'High').length;
  const foodItemsCount = items.filter(i => i.category === 'Food').length;

  return (
    <div style={{ maxWidth: '1100px', margin: '2rem auto' }} className="animate-fade-in">
      
      {/* Donor Banner */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#ffffff', marginBottom: '0.3rem' }}>
            Welcome back, <span style={{ color: '#34d399' }}>{donor?.name || 'Donor'}</span> 👋
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.92rem' }}>
            Location: <strong style={{ color: '#e5e7eb' }}>{donor?.location || 'Not Specified'}</strong> | Email: <strong style={{ color: '#e5e7eb' }}>{donor?.email}</strong>
          </p>
        </div>

        <button className="btn-primary" onClick={onNavigateToAdd} style={{ padding: '0.85rem 1.6rem', fontSize: '0.95rem' }}>
          <PlusCircle size={20} /> Add Surplus Item
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.8rem', borderRadius: '12px', color: '#34d399' }}>
            <Package size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Total Items Submitted</span>
            <h2 style={{ fontSize: '1.6rem', color: '#ffffff' }}>{items.length}</h2>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '0.8rem', borderRadius: '12px', color: '#fca5a5' }}>
            <Activity size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>High Priority Items</span>
            <h2 style={{ fontSize: '1.6rem', color: '#ffffff' }}>{highPriorityCount}</h2>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(34, 211, 238, 0.15)', padding: '0.8rem', borderRadius: '12px', color: '#22d3ee' }}>
            <Sparkles size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>AI Analyzed & Persisted</span>
            <h2 style={{ fontSize: '1.6rem', color: '#ffffff' }}>{items.length}</h2>
          </div>
        </div>

      </div>

      {/* Items Section */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={22} color="#34d399" /> Your Submitted Surplus Items
          </h2>

          <button className="btn-secondary" onClick={fetchDonorItems} style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}>
            <RefreshCw size={14} /> Refresh List
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#9ca3af' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.5rem auto' }} />
            <p>Loading surplus items...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '1.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', color: '#fca5a5' }}>
            {error}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.08)' }}>
            <Package size={48} color="#4b5563" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: '#e5e7eb', fontSize: '1.1rem' }}>No surplus items submitted yet</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: '0.4rem', marginBottom: '1.5rem' }}>
              Click below to submit your first item for AI analysis & waste redistribution.
            </p>
            <button className="btn-primary" onClick={onNavigateToAdd}>
              <PlusCircle size={18} /> Add Surplus Item
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map((item) => {
              const analysis = item.analysisResult;
              const imgUrl = item.imagePath ? `http://localhost:8080${item.imagePath}` : null;

              return (
                <div key={item.id} className="glass-card" style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '1.25rem', alignItems: 'center' }}>
                  
                  {/* Item Image Thumbnail */}
                  <div style={{ width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {imgUrl ? (
                      <img src={imgUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Package size={32} color="#6b7280" />
                    )}
                  </div>

                  {/* Main Details */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                      <h3 style={{ fontSize: '1.1rem', color: '#ffffff' }}>{item.name}</h3>
                      <span className="badge badge-category">{item.category}</span>
                      {analysis?.priority && (
                        <span className={`badge priority-${(analysis.priority || '').toLowerCase()}`}>
                          {analysis.priority} Priority
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.4rem' }}>
                      Quantity: <strong style={{ color: '#e5e7eb' }}>{item.quantity}</strong> | Location: <strong style={{ color: '#e5e7eb' }}>{item.location}</strong>
                    </p>

                    {analysis && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: '#6b7280' }}>
                        <span style={{ color: '#bfdbfe' }}>Condition: {analysis.itemCondition}</span>
                        <span>•</span>
                        <span style={{ color: '#22d3ee' }}>AI Confidence: {analysis.confidence}%</span>
                        {analysis.estimatedShelfLife && (
                          <>
                            <span>•</span>
                            <span style={{ color: '#fcd34d' }}>Shelf Life: {analysis.estimatedShelfLife}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div>
                    <button 
                      className="btn-secondary" 
                      onClick={() => onViewResult({ item, analysisResult: item.analysisResult })}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    >
                      <Sparkles size={16} /> View AI Report
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default DonorDashboard;
