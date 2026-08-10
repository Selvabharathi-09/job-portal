import React, { useState } from 'react';
import { Save, User, Mail, Phone } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const HRProfile = () => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.hr_profile?.phone || '');
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone);
      if (photo) formData.append('profile_photo', photo);

      const res = await api.put('/hr/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.success) {
        setMsg('HR Profile updated successfully!');
        await refreshUser();
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 className="heading-lg" style={{ marginBottom: '1.5rem' }}>HR Recruiter Profile</h1>

      {msg && <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#dcfce7', color: '#15803d', marginBottom: '1rem', fontWeight: 600 }}>{msg}</div>}

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="form-group">
          <label className="form-label">Work Email (Read only)</label>
          <input type="email" className="form-input" value={user?.email || ''} disabled style={{ backgroundColor: '#f1f5f9' }} />
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input type="text" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Upload Profile Photo</label>
          <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} />
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1rem' }}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default HRProfile;
