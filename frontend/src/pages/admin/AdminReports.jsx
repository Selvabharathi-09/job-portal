import React, { useState, useEffect } from 'react';
import { Flag, ShieldAlert, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get('/admin/reports');
      if (res.success) setReports(res.data.reports || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId, action) => {
    try {
      const res = await api.put(`/admin/reports/${reportId}/action`, { action });
      if (res.success) {
        setReports(reports.map(r => r.id === reportId ? { ...r, status: 'resolved' } : r));
      }
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="heading-lg">Violation & Suspicious Content Reports</h1>
        <p className="text-muted">Investigate user reports regarding fake job postings or suspicious recruiter activity</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading user reports...</div>
      ) : reports.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <Flag size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
          <h3>No Violation Reports Filed</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Reporter</th>
                <th>Target Job / HR</th>
                <th>Report Details / Reason</th>
                <th>Status</th>
                <th>Filed Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((rep) => (
                <tr key={rep.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{rep.reporter_name}</div>
                  </td>
                  <td>
                    {rep.job_title && <div style={{ fontWeight: 600, color: '#4f46e5' }}>Job: {rep.job_title}</div>}
                    {rep.hr_name && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>HR: {rep.hr_name}</div>}
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    <p style={{ fontSize: '0.85rem', color: '#334155' }}>{rep.reason}</p>
                  </td>
                  <td><StatusBadge status={rep.status} /></td>
                  <td style={{ color: '#64748b' }}>
                    {rep.created_at ? new Date(rep.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    {rep.status === 'pending' ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                        {rep.job_id && (
                          <button onClick={() => handleReportAction(rep.id, 'suspend_job')} className="btn btn-danger btn-sm" style={{ fontSize: '0.75rem' }}>
                            Close Job
                          </button>
                        )}
                        {rep.hr_id && (
                          <button onClick={() => handleReportAction(rep.id, 'suspend_hr')} className="btn btn-danger btn-sm" style={{ fontSize: '0.75rem' }}>
                            Suspend HR
                          </button>
                        )}
                        <button onClick={() => handleReportAction(rep.id, 'resolve')} className="btn btn-success btn-sm" style={{ fontSize: '0.75rem' }}>
                          Resolve
                        </button>
                        <button onClick={() => handleReportAction(rep.id, 'dismiss')} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>
                          Dismiss
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>Resolved</span>
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

export default AdminReports;
