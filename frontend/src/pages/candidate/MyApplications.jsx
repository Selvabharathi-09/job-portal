import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Building2, MapPin, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/user/applications');
      if (res.success) setApplications(res.data.applications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="heading-lg">My Applications</h1>
        <p className="text-muted">Track application progress across hiring recruiters</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading application status...</div>
      ) : applications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <FileText size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
          <h3>No Job Applications Found</h3>
          <p className="text-muted" style={{ margin: '0.5rem 0 1.5rem' }}>Start applying to top positions today.</p>
          <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Job Position</th>
                <th>Company</th>
                <th>Applied Date</th>
                <th>Expected Salary</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{app.job?.title || 'Job Position'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {app.job?.location}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{app.job?.company?.name || 'Company'}</div>
                  </td>
                  <td style={{ color: '#64748b' }}>
                    {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'Recently'}
                  </td>
                  <td>{app.expected_salary || 'Not specified'}</td>
                  <td><StatusBadge status={app.status} /></td>
                  <td>
                    <Link to={`/jobs/${app.job_id}`} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      View Job <ExternalLink size={12} />
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

export default MyApplications;
