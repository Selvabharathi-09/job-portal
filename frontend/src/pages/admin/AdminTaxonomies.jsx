import React, { useState, useEffect } from 'react';
import { Tags, Plus, Trash2, MapPin, Code, Briefcase } from 'lucide-react';
import api from '../../services/api';

const AdminTaxonomies = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [skills, setSkills] = useState([]);

  // Form states
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  const [locCity, setLocCity] = useState('');
  const [locState, setLocState] = useState('');
  const [locCountry, setLocCountry] = useState('India');

  const [skillName, setSkillName] = useState('');
  const [skillCategory, setSkillCategory] = useState('General');

  useEffect(() => {
    fetchTaxonomies();
  }, []);

  const fetchTaxonomies = async () => {
    try {
      const [catRes, locRes, skRes] = await Promise.all([
        api.get('/categories'),
        api.get('/locations'),
        api.get('/skills')
      ]);
      if (catRes.success) setCategories(catRes.data.categories || []);
      if (locRes.success) setLocations(locRes.data.locations || []);
      if (skRes.success) setSkills(skRes.data.skills || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/categories', { name: catName, description: catDesc });
      if (res.success) {
        setCatName(''); setCatDesc('');
        fetchTaxonomies();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete category?")) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      fetchTaxonomies();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/locations', { city: locCity, state: locState, country: locCountry });
      if (res.success) {
        setLocCity(''); setLocState('');
        fetchTaxonomies();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteLocation = async (id) => {
    if (!window.confirm("Delete location?")) return;
    try {
      await api.delete(`/admin/locations/${id}`);
      fetchTaxonomies();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/skills', { name: skillName, category: skillCategory });
      if (res.success) {
        setSkillName('');
        fetchTaxonomies();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSkill = async (id) => {
    if (!window.confirm("Delete skill?")) return;
    try {
      await api.delete(`/admin/skills/${id}`);
      fetchTaxonomies();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="heading-lg">Platform Taxonomies & Metadata</h1>
        <p className="text-muted">Manage Job Categories, Target Locations, and Master Skill sets</p>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('categories')}
          style={{
            padding: '0.75rem 1.25rem', border: 'none', borderBottom: activeTab === 'categories' ? '3px solid #4f46e5' : '3px solid transparent',
            fontWeight: 700, cursor: 'pointer', background: 'none', color: activeTab === 'categories' ? '#4f46e5' : '#64748b', display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          <Briefcase size={18} /> Job Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('locations')}
          style={{
            padding: '0.75rem 1.25rem', border: 'none', borderBottom: activeTab === 'locations' ? '3px solid #4f46e5' : '3px solid transparent',
            fontWeight: 700, cursor: 'pointer', background: 'none', color: activeTab === 'locations' ? '#4f46e5' : '#64748b', display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          <MapPin size={18} /> Locations ({locations.length})
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          style={{
            padding: '0.75rem 1.25rem', border: 'none', borderBottom: activeTab === 'skills' ? '3px solid #4f46e5' : '3px solid transparent',
            fontWeight: 700, cursor: 'pointer', background: 'none', color: activeTab === 'skills' ? '#4f46e5' : '#64748b', display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          <Code size={18} /> Master Skills ({skills.length})
        </button>
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
          <form onSubmit={handleAddCategory} className="card">
            <h3 className="heading-md" style={{ marginBottom: '1rem' }}>Create Category</h3>
            <div className="form-group">
              <label className="form-label">Category Name</label>
              <input type="text" className="form-input" placeholder="e.g. Cybersecurity" value={catName} onChange={(e) => setCatName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" rows={3} placeholder="Scope overview..." value={catDesc} onChange={(e) => setCatDesc(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>Save Category</button>
          </form>

          <div className="card">
            <h3 className="heading-md" style={{ marginBottom: '1rem' }}>Existing Categories</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {categories.map((c) => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>{c.name}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.description}</div>
                  </div>
                  <button onClick={() => handleDeleteCategory(c.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Locations Tab */}
      {activeTab === 'locations' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
          <form onSubmit={handleAddLocation} className="card">
            <h3 className="heading-md" style={{ marginBottom: '1rem' }}>Create Location</h3>
            <div className="form-group">
              <label className="form-label">City Name</label>
              <input type="text" className="form-input" placeholder="e.g. Chennai" value={locCity} onChange={(e) => setLocCity(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">State / Region</label>
              <input type="text" className="form-input" placeholder="Tamil Nadu" value={locState} onChange={(e) => setLocState(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>Save Location</button>
          </form>

          <div className="card">
            <h3 className="heading-md" style={{ marginBottom: '1rem' }}>Existing Locations</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {locations.map((l) => (
                <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem' }}>{l.city}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{l.state}, {l.country}</div>
                  </div>
                  <button onClick={() => handleDeleteLocation(l.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Skills Tab */}
      {activeTab === 'skills' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
          <form onSubmit={handleAddSkill} className="card">
            <h3 className="heading-md" style={{ marginBottom: '1rem' }}>Create Skill</h3>
            <div className="form-group">
              <label className="form-label">Skill Name</label>
              <input type="text" className="form-input" placeholder="e.g. Docker" value={skillName} onChange={(e) => setSkillName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input type="text" className="form-input" placeholder="e.g. DevOps" value={skillCategory} onChange={(e) => setSkillCategory(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>Save Skill</button>
          </form>

          <div className="card">
            <h3 className="heading-md" style={{ marginBottom: '1rem' }}>Master Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {skills.map((s) => (
                <span key={s.id} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.375rem 0.75rem',
                  borderRadius: '9999px', backgroundColor: '#eef2ff', color: '#4f46e5', fontWeight: 600, fontSize: '0.85rem'
                }}>
                  {s.name}
                  <button onClick={() => handleDeleteSkill(s.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>×</button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTaxonomies;
