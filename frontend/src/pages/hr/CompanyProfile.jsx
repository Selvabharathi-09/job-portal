import React, { useState, useEffect } from 'react';
import { Save, Building2, Globe, MapPin, Upload } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CompanyProfile = () => {
  const { refreshUser } = useAuth();
  const [company, setCompany] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState('50-200 Employees');
  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const res = await api.get('/hr/company');
      if (res.success && res.data.company) {
        const c = res.data.company;
        setCompany(c);
        setName(c.name || '');
        setDescription(c.description || '');
        setWebsite(c.website || '');
        setLocation(c.location || '');
        setIndustry(c.industry || '');
        setSize(c.size || '50-200 Employees');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('website', website);
      formData.append('location', location);
      formData.append('industry', industry);
      formData.append('size', size);
      if (logoFile) formData.append('logo', logoFile);

      const res = await api.put('/hr/company', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.success) {
        setMsg('Company profile updated successfully!');
        await refreshUser();
        fetchCompany();
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading company profile...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="heading-lg" style={{ marginBottom: '1.5rem' }}>Manage Company Profile</h1>

      {msg && <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#dcfce7', color: '#15803d', marginBottom: '1rem', fontWeight: 600 }}>{msg}</div>}

      <form onSubmit={handleSubmit} className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '10px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {company?.logo ? (
              <img src={`http://127.0.0.1:5000${company.logo}`} alt={company.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Building2 size={36} style={{ color: '#4f46e5' }} />
            )}
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Upload Company Logo</label>
            <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Company Name</label>
          <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Industry</label>
            <input type="text" className="form-input" placeholder="Software & IT Services" value={industry} onChange={(e) => setIndustry(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Company Size</label>
            <select className="form-select" value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="1-10 Employees">1-10 Employees</option>
              <option value="11-50 Employees">11-50 Employees</option>
              <option value="50-200 Employees">50-200 Employees</option>
              <option value="200-500 Employees">200-500 Employees</option>
              <option value="500-1000 Employees">500-1000 Employees</option>
              <option value="1000+ Employees">1000+ Employees</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Headquarters Location</label>
            <input type="text" className="form-input" placeholder="Bangalore, India" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Website URL</label>
            <input type="url" className="form-input" placeholder="https://example.com" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Company Description / Overview</label>
          <textarea className="form-textarea" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1rem' }}>
          <Save size={16} /> {saving ? 'Saving...' : 'Update Company Profile'}
        </button>
      </form>
    </div>
  );
};

export default CompanyProfile;
