import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Building2, MapPin, Globe, Users, Briefcase } from 'lucide-react';
import api from '../../services/api';
import JobCard from '../../components/JobCard';

const CompanyDetails = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const fetchCompany = async () => {
    try {
      const res = await api.get(`/companies/${id}`);
      if (res.success) setCompany(res.data.company);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem', color: '#64748b' }}>Loading company profile...</div>;
  if (!company) return <div className="card" style={{ textAlign: 'center', padding: '4rem', margin: '2rem auto', maxWidth: '600px' }}>Company not found</div>;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1rem' }}>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '12px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {company.logo ? (
              <img src={`http://127.0.0.1:5000${company.logo}`} alt={company.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Building2 size={40} style={{ color: '#4f46e5' }} />
            )}
          </div>
          <div>
            <h1 className="heading-lg">{company.name}</h1>
            <div style={{ fontSize: '1rem', color: '#0ea5e9', fontWeight: 600 }}>{company.industry || 'Technology'}</div>
            <p style={{ marginTop: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>{company.description}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0', fontSize: '0.875rem' }}>
          <div>
            <span className="text-muted">Location:</span>
            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={16} /> {company.location || 'Not specified'}
            </div>
          </div>
          <div>
            <span className="text-muted">Company Size:</span>
            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={16} /> {company.size || '50-200 Employees'}
            </div>
          </div>
          {company.website && (
            <div>
              <span className="text-muted">Website:</span>
              <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Globe size={16} /> <a href={company.website} target="_blank" rel="noreferrer" style={{ color: '#4f46e5' }}>Visit Website</a>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="heading-md" style={{ marginBottom: '1.25rem' }}>Active Openings ({company.published_jobs?.length || 0})</h2>
        {(!company.published_jobs || company.published_jobs.length === 0) ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p className="text-muted">No open job positions posted by this company at the moment.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {company.published_jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDetails;
