import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit3, Trash2, Users, Lock, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

const HRManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/hr/jobs');
      if (res.success) setJobs(res.data.jobs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleClose = async (job) => {
    const newStatus = job.status === 'closed' ? 'published' : 'closed';
    try {
      const res = await api.put(`/hr/jobs/${job.id}`, { status: newStatus });
      if (res.success) {
        setJobs(jobs.map(j => j.id === job.id ? { ...j, status: newStatus } : j));
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job posting? Existing application records will be preserved.")) return;
    try {
      const res = await api.delete(`/hr/jobs/${jobId}`);
      if (res.success) {
        setJobs(jobs.filter(j => j.id !== jobId));
      }
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 className="heading-lg">Manage Company Job Postings</h1>
          <p className="text-muted">Review, edit, close, or view applicants for your company positions</p>
        </div>
        <Link to="/hr/jobs/create" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PlusCircle size={18} /> Post New Job
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading job listings...</div>
      ) : jobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <h3>No Job Postings Yet</h3>
          <p className="text-muted" style={{ margin: '0.5rem 0 1.5rem' }}>Create your first job posting to start receiving candidate applications.</p>
          <Link to="/hr/jobs/create" className="btn btn-primary">Post a Job</Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Location & Type</th>
                <th>Applicants</th>
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
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{job.category || 'General'}</div>
                  </td>
                  <td>
                    <div>{job.location}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{job.work_type} • {job.employment_type}</div>
                  </td>
                  <td>
                    <Link to={`/hr/applications?job_id=${job.id}`} style={{ fontWeight: 700, color: '#4f46e5', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={16} /> {job.applications_count} Candidates
                    </Link>
                  </td>
                  <td><StatusBadge status={job.status} /></td>
                  <td style={{ color: '#64748b' }}>
                    {job.created_at ? new Date(job.created_at).toLocaleDateString() : ''}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Link to={`/hr/jobs/${job.id}/edit`} className="btn btn-outline btn-sm" title="Edit">
                        <Edit3 size={14} />
                      </Link>

                      <button
                        onClick={() => handleToggleClose(job)}
                        className={`btn btn-sm ${job.status === 'closed' ? 'btn-success' : 'btn-secondary'}`}
                        title={job.status === 'closed' ? 'Reopen Job' : 'Close Job'}
                      >
                        {job.status === 'closed' ? 'Reopen' : 'Close'}
                      </button>

                      <button onClick={() => handleDelete(job.id)} className="btn btn-danger btn-sm" title="Delete">
                        <Trash2 size={14} />
                      </button>
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

export default HRManageJobs;
