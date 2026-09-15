import React from 'react';
import { 
  Sparkles, CheckCircle2, ShieldCheck, Clock, Layers, 
  MapPin, Package, ArrowRight, PlusCircle, LayoutDashboard,
  AlertTriangle, Activity, Database
} from 'lucide-react';

const AnalysisResultCard = ({ resultData, onDone, onAddAnother }) => {
  const { item, analysisResult } = resultData || {};

  if (!item || !analysisResult) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', margin: '3rem auto', maxWidth: '600px' }}>
        <p style={{ color: '#9ca3af' }}>No analysis result available.</p>
        <button className="btn-primary" onClick={onDone} style={{ marginTop: '1rem' }}>Return to Dashboard</button>
      </div>
    );
  }

  const isFood = analysisResult.predictedCategory === 'Food' || item.category === 'Food';

  const getPriorityBadgeClass = (priority) => {
    switch ((priority || '').toUpperCase()) {
      case 'HIGH': return 'priority-high';
      case 'MEDIUM': return 'priority-medium';
      case 'LOW': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const imageUrl = item.imagePath ? `http://localhost:8080${item.imagePath}` : null;

  return (
    <div style={{ maxWidth: '840px', margin: '2rem auto' }} className="animate-fade-in">
      <div className="glass-panel" style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
        
        {/* Glow Header */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #10b981, #22d3ee, #059669)'
        }} />

        {/* Header Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '0.65rem',
              borderRadius: '12px',
              color: '#34d399',
              display: 'flex'
            }}>
              <CheckCircle2 size={26} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', color: '#ffffff' }}>AI Surplus Item Analysis Complete</h2>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                Item successfully evaluated by Python AI Engine & persisted to MySQL Database
              </p>
            </div>
          </div>

          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
            <Database size={14} /> Saved in Database (ID: #{item.id})
          </span>
        </div>

        {/* AI Analysis Metric Grid */}
        <div style={{
          background: 'rgba(10, 15, 29, 0.6)',
          border: '1px solid var(--border-emerald)',
          borderRadius: '16px',
          padding: '1.8rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ fontSize: '1.1rem', color: '#34d399', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} /> AI Diagnostic Summary
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.2rem' }}>
            
            {/* 1. Predicted Category */}
            <div className="glass-card">
              <span style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '0.4rem' }}>
                Predicted Category
              </span>
              <span className="badge badge-category" style={{ fontSize: '0.95rem' }}>
                <Layers size={16} /> {analysisResult.predictedCategory}
              </span>
              {analysisResult.predictedCategory !== item.category && (
                <p style={{ fontSize: '0.75rem', color: '#fcd34d', marginTop: '0.4rem' }}>
                  (Original declaration: {item.category})
                </p>
              )}
            </div>

            {/* 2. Item Condition */}
            <div className="glass-card">
              <span style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '0.4rem' }}>
                Item Condition
              </span>
              <span className="badge badge-condition" style={{ fontSize: '0.95rem' }}>
                <ShieldCheck size={16} /> {analysisResult.itemCondition}
              </span>
            </div>

            {/* 3. Priority Level */}
            <div className="glass-card">
              <span style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '0.4rem' }}>
                Redistribution Priority
              </span>
              <span className={`badge ${getPriorityBadgeClass(analysisResult.priority)}`} style={{ fontSize: '0.95rem' }}>
                <Activity size={16} /> {analysisResult.priority} Priority
              </span>
            </div>

            {/* 4. AI Confidence Score */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>AI Confidence</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#22d3ee' }}>{analysisResult.confidence}%</span>
              </div>
              <div className="confidence-bar-bg" style={{ marginTop: '0.4rem' }}>
                <div className="confidence-bar-fill" style={{ width: `${analysisResult.confidence}%` }} />
              </div>
            </div>

          </div>

          {/* 5. Food Shelf Life (Conditional for Food) */}
          {isFood && analysisResult.estimatedShelfLife && (
            <div style={{
              marginTop: '1.5rem',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px',
              padding: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '0.6rem', borderRadius: '10px', color: '#fcd34d', display: 'flex' }}>
                <Clock size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#fcd34d', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Food Shelf-Life & Usable Time Estimate
                </span>
                <h4 style={{ fontSize: '1.1rem', color: '#ffffff', marginTop: '0.2rem' }}>
                  {analysisResult.estimatedShelfLife}
                </h4>
              </div>
            </div>
          )}
        </div>

        {/* Item Information Breakdown */}
        <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
          
          <div>
            <h3 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '1rem' }}>Submitted Details</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: '#9ca3af' }}>Item Name: </span>
                <strong style={{ color: '#ffffff' }}>{item.name}</strong>
              </div>

              <div>
                <span style={{ color: '#9ca3af' }}>Quantity: </span>
                <strong style={{ color: '#ffffff' }}>{item.quantity}</strong>
              </div>

              <div>
                <span style={{ color: '#9ca3af' }}>Location: </span>
                <strong style={{ color: '#ffffff' }}>{item.location}</strong>
              </div>

              {item.description && (
                <div>
                  <span style={{ color: '#9ca3af' }}>Description: </span>
                  <p style={{ color: '#d1d5db', marginTop: '0.2rem', background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '8px' }}>
                    {item.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Uploaded Image Box */}
          <div>
            <h3 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '1rem' }}>Item Image</h3>
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={item.name} 
                style={{ width: '100%', maxHeight: '220px', borderRadius: '12px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} 
              />
            ) : (
              <div style={{ height: '160px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                No image uploaded
              </div>
            )}
          </div>

        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button className="btn-secondary" onClick={onAddAnother}>
            <PlusCircle size={18} /> Add Another Surplus Item
          </button>
          
          <button className="btn-primary" onClick={onDone}>
            <LayoutDashboard size={18} /> Back to Donor Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};

export default AnalysisResultCard;
