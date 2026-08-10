import React, { useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/admin/applications');
      if (res.success) setApplications(res.data.applications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="heading-lg">Platform Applications Overview</h1>
        <p className="text-muted">Global tracking of candidate applications across all employers</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading applications...</div>
      ) : applications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <FileText size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
          <h3>No Applications Submitted</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Job Title</th>
                <th>Company</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Resume</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{app.candidate?.user_name || 'Candidate'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.candidate?.user_email}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{app.job?.title || 'Job Position'}</td>
                  <td>{app.job?.company?.name || 'Company'}</td>
                  <td><StatusBadge status={app.status} /></td>
                  <td style={{ color: '#64748b' }}>
                    {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    {app.candidate?.resume_path ? (
                      <a
                        href={`http://127.0.0.1:5000${app.candidate.resume_path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Download size={12} /> Resume PDF
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>None</span>
                    )}
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

export default AdminApplications;
