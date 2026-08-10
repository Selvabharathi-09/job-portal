import React, { useState, useEffect } from 'react';
import { Building2, Globe, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/companies');
      if (res.success) setCompanies(res.data.companies || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="heading-lg">Registered Companies</h1>
        <p className="text-muted">Global overview of all companies registered on the platform</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading companies...</div>
      ) : companies.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <Building2 size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
          <h3>No Companies Registered</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Industry</th>
                <th>Location</th>
                <th>Size</th>
                <th>Active Jobs</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((comp) => (
                <tr key={comp.id}>
                  <td style={{ fontWeight: 700 }}>{comp.name}</td>
                  <td>{comp.industry || 'Technology'}</td>
                  <td>{comp.location || 'Global'}</td>
                  <td>{comp.size || '50-200'}</td>
                  <td style={{ fontWeight: 700, color: '#4f46e5' }}>{comp.active_jobs_count} Jobs</td>
                  <td>
                    <Link to={`/companies/${comp.id}`} target="_blank" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      View Company <ExternalLink size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCompanies;
