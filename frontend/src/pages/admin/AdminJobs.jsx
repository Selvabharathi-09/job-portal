import React, { useState, useEffect } from 'react';
import { Briefcase, CheckCircle2, XCircle, Trash2, Eye, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const fetchJobs = async () => {
    try {
      const res = await api.get(`/admin/jobs?status=${statusFilter}`);
      if (res.success) setJobs(res.data.jobs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveJob = async (jobId) => {
    try {
      const res = await api.put(`/admin/jobs/${jobId}/approve`);
      if (res.success) {
        setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'published' } : j));
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleRejectJob = async (jobId) => {
    try {
      const res = await api.put(`/admin/jobs/${jobId}/reject`);
      if (res.success) {
        setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'rejected' } : j));
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to permanently delete this job listing?")) return;
    try {
      const res = await api.delete(`/admin/jobs/${jobId}`);
      if (res.success) {
        setJobs(jobs.filter(j => j.id !== jobId));
      }
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="heading-lg">Job Moderation & Approvals</h1>
          <p className="text-muted">Review job postings created by HR before making them visible publicly</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>Status Filter:</span>
          <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Jobs</option>
            <option value="pending">Pending Approval</option>
            <option value="published">Published Live</option>
            <option value="rejected">Rejected</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading job postings...</div>
      ) : jobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <Briefcase size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
          <h3>No Jobs Found</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Job Title & Company</th>
                <th>Location & Work Mode</th>
                <th>Salary Range</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{job.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 600 }}>{job.company?.name || 'Company'}</div>
                  </td>
                  <td>
                    <div>{job.location}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{job.work_type} • {job.employment_type}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {job.salary_min && job.salary_max ? `₹${(job.salary_min/100000).toFixed(1)}L - ₹${(job.salary_max/100000).toFixed(1)}L` : 'Negotiable'}
                  </td>
                  <td><StatusBadge status={job.status} /></td>
                  <td style={{ color: '#64748b' }}>
                    {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Link to={`/jobs/${job.id}`} target="_blank" className="btn btn-outline btn-sm" title="View Job Details">
                        <ExternalLink size={14} />
                      </Link>

                      {job.status === 'pending' ? (
                        <>
                          <button onClick={() => handleApproveJob(job.id)} className="btn btn-success btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={14} /> Approve
                          </button>
                          <button onClick={() => handleRejectJob(job.id)} className="btn btn-danger btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <XCircle size={14} /> Reject
                          </button>
                        </>
                      ) : (
                        <button onClick={() => handleDeleteJob(job.id)} className="btn btn-danger btn-sm">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
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

export default AdminJobs;
