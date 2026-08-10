import React, { useState, useEffect } from 'react';
import { UserCheck, CheckCircle2, XCircle, Building2 } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

const AdminHRs = () => {
  const [hrs, setHrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchHRs();
  }, [statusFilter]);

  const fetchHRs = async () => {
    try {
      const res = await api.get(`/admin/hrs?status=${statusFilter}`);
      if (res.success) setHrs(res.data.hrs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveHR = async (hrId) => {
    try {
      const res = await api.put(`/admin/hrs/${hrId}/approve`);
      if (res.success) {
        setHrs(hrs.map(h => h.id === hrId ? { ...h, status: 'active' } : h));
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleRejectHR = async (hrId) => {
    try {
      const res = await api.put(`/admin/hrs/${hrId}/reject`);
      if (res.success) {
        setHrs(hrs.map(h => h.id === hrId ? { ...h, status: 'rejected' } : h));
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleToggleStatus = async (hr) => {
    const newStatus = hr.status === 'active' ? 'deactivated' : 'active';
    try {
      const res = await api.put(`/admin/hrs/${hr.id}/status`, { status: newStatus });
      if (res.success) {
        setHrs(hrs.map(h => h.id === hr.id ? { ...h, status: newStatus } : h));
      }
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="heading-lg">HR Recruiter Approvals & Management</h1>
          <p className="text-muted">Approve pending HR registrations and manage recruiter access</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>Status Filter:</span>
          <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending Approval</option>
            <option value="active">Active Approved</option>
            <option value="rejected">Rejected</option>
            <option value="deactivated">Deactivated</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading HR accounts...</div>
      ) : hrs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <UserCheck size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
          <h3>No HR Accounts Found</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>HR Recruiter</th>
                <th>Company</th>
                <th>Work Email</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hrs.map((hr) => (
                <tr key={hr.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{hr.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Phone: {hr.hr_profile?.phone || 'N/A'}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Building2 size={14} /> {hr.hr_profile?.company?.name || 'Company'}
                    </div>
                  </td>
                  <td style={{ color: '#64748b' }}>{hr.email}</td>
                  <td><StatusBadge status={hr.status} /></td>
                  <td style={{ color: '#64748b' }}>
                    {hr.created_at ? new Date(hr.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    {hr.status === 'pending' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button onClick={() => handleApproveHR(hr.id)} className="btn btn-success btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={14} /> Approve
                        </button>
                        <button onClick={() => handleRejectHR(hr.id)} className="btn btn-danger btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleToggleStatus(hr)}
                        className={`btn btn-sm ${hr.status === 'active' ? 'btn-outline' : 'btn-success'}`}
                      >
                        {hr.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                      </button>
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

export default AdminHRs;
