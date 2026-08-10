import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Search } from 'lucide-react';
import api from '../../services/api';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, [search]);

  const fetchCompanies = async () => {
    try {
      const res = await api.get(`/companies?search=${encodeURIComponent(search)}`);
      if (res.success) setCompanies(res.data.companies || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
        <h1 className="heading-lg">Top Hiring Companies</h1>
        <p className="text-muted" style={{ marginTop: '0.5rem' }}>Explore verified enterprise employers and corporate culture.</p>
        
        <div style={{ marginTop: '1.5rem', position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.75rem', borderRadius: '9999px' }}
            placeholder="Search company name or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Loading hiring companies...</div>
      ) : companies.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <h3>No Companies Found</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {companies.map((comp) => (
            <Link key={comp.id} to={`/companies/${comp.id}`} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '10px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {comp.logo ? (
                      <img src={`http://127.0.0.1:5000${comp.logo}`} alt={comp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Building2 size={28} style={{ color: '#4f46e5' }} />
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>{comp.name}</h3>
                    <span style={{ fontSize: '0.8rem', color: '#0ea5e9', fontWeight: 600 }}>{comp.industry || 'Technology'}</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1rem' }}>
                  {comp.description || 'Leading enterprise offering high growth career opportunities.'}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', fontSize: '0.8rem', color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} /> {comp.location || 'Global'}
                </span>
                <span style={{ fontWeight: 700, color: '#4f46e5' }}>
                  {comp.active_jobs_count} Open Jobs
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Companies;
