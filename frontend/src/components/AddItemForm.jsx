import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { itemService } from '../services/api';
import { Sparkles, Upload, Package, MapPin, Layers, FileText, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';

const AddItemForm = ({ onAnalysisComplete }) => {
  const { donor } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Food',
    quantity: '1',
    location: donor?.location || ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const CATEGORIES = ['Food', 'Clothes', 'Books', 'Furniture', 'Electronics'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.category || !formData.quantity || !formData.location) {
      setError('Please complete required fields (Item Name, Category, Quantity, and Location).');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('donorId', donor.id);
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('quantity', formData.quantity);
      data.append('location', formData.location);
      if (imageFile) {
        data.append('image', imageFile);
      }

      const response = await itemService.analyzeAndSave(data);
      if (response && response.item) {
        // Pass complete item + AI analysis result to parent view handler
        onAnalysisComplete(response);
      } else {
        setError('Failed to process item analysis.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error executing AI analysis & saving item to database. Make sure Spring Boot backend is active on port 8080.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '2rem auto' }} className="animate-fade-in">
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.2rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #10b981, #22d3ee)',
            padding: '0.75rem',
            borderRadius: '14px',
            color: '#0a0f1d',
            display: 'flex'
          }}>
            <Sparkles size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', color: '#ffffff' }}>Add Surplus Item for AI Analysis</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.88rem' }}>
              Enter details & upload image. Our Python FastAPI AI engine will categorize, score priority, evaluate condition, and estimate food shelf life.
            </p>
          </div>
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
          <div className="grid-2">
            
            {/* Item Name */}
            <div className="form-group">
              <label>Surplus Item Name *</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. Fresh Cooked Meals / Cotton Shirts"
                  value={formData.name}
                  onChange={handleChange}
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  required
                />
                <Package size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="form-group">
              <label>Declared Category *</label>
              <div style={{ position: 'relative' }}>
                <select 
                  name="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleChange}
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  required
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat} style={{ background: '#0a0f1d', color: '#ffffff' }}>
                      {cat}
                    </option>
                  ))}
                </select>
                <Layers size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              </div>
            </div>

          </div>

          <div className="grid-2">
            {/* Quantity */}
            <div className="form-group">
              <label>Quantity / Units *</label>
              <input 
                type="text"
                name="quantity"
                className="form-control"
                placeholder="e.g. 15 boxes / 5 pairs / 10 books"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>

            {/* Location */}
            <div className="form-group">
              <label>Pickup Location *</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text"
                  name="location"
                  className="form-control"
                  placeholder="e.g. Koramangala 5th Block, Bangalore"
                  value={formData.location}
                  onChange={handleChange}
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  required
                />
                <MapPin size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Item Description & Condition Notes</label>
            <textarea 
              name="description"
              className="form-control"
              rows={3}
              placeholder="Provide details (e.g. freshly prepared hot rice and curry packed 1 hour ago / gently used books in mint condition)..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Image Upload Component */}
          <div className="form-group">
            <label>Upload Item Image</label>
            <div 
              className="image-upload-box"
              onClick={() => document.getElementById('item-image-input').click()}
            >
              <input 
                id="item-image-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />

              {imagePreview ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <img 
                    src={imagePreview} 
                    alt="Upload Preview" 
                    style={{ maxHeight: '160px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border-emerald)' }} 
                  />
                  <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 500 }}>
                    Click to change image ({imageFile?.name})
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: '#9ca3af' }}>
                  <ImageIcon size={36} color="#34d399" />
                  <p style={{ fontSize: '0.9rem', fontWeight: 500, color: '#f3f4f6' }}>
                    Click or drop image file here to upload
                  </p>
                  <p style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                    Supports JPG, PNG, WEBP (Max 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={20} className="animate-spin" /> Running AI Analysis & Saving to MySQL...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={20} /> Analyze Item with AI & Save
                </span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default AddItemForm;
