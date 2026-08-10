import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import api from '../../services/api';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-logs');
      if (res.success) setLogs(res.data.logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 className="heading-lg">System Activity & Audit Logs</h1>
          <p className="text-muted">Immutable audit trail of user logins, role actions, status changes, and security events</p>
        </div>

        <button onClick={fetchAuditLogs} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <RefreshCw size={14} /> Refresh Logs
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading security audit logs...</div>
      ) : logs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <ShieldAlert size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
          <h3>No Audit Log Records</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User / Identity</th>
                <th>Role</th>
                <th>Action</th>
                <th>Details</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                    {log.created_at ? new Date(log.created_at).toLocaleString() : ''}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{log.user_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{log.user_email}</div>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 700,
                      backgroundColor: log.user_role === 'ADMIN' ? '#e0e7ff' : log.user_role === 'HR' ? '#e0f2fe' : '#f1f5f9',
                      color: log.user_role === 'ADMIN' ? '#3730a3' : log.user_role === 'HR' ? '#0369a1' : '#475569'
                    }}>
                      {log.user_role}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{log.action}</td>
                  <td style={{ fontSize: '0.85rem', color: '#475569' }}>{log.details || '-'}</td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace' }}>{log.ip_address || '127.0.0.1'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;
