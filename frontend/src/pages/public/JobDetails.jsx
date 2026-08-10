import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Briefcase, DollarSign, Clock, Building2, Calendar, CheckCircle2, Bookmark, Send, Flag, ShieldAlert } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('30 Days');
  const [reportReason, setReportReason] = useState('');
  const [applyMsg, setApplyMsg] = useState({ type: '', text: '' });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobDetails();
    if (user && user.role === 'USER') {
      checkApplicationAndSaveStatus();
    }
  }, [id, user]);

  const fetchJobDetails = async () => {
    try {
      const res = await api.get(`/jobs/${id}`);
      if (res.success) setJob(res.data.job);
    } catch (err) {
      console.error("Job not found", err);
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationAndSaveStatus = async () => {
    try {
      const [appsRes, savedRes] = await Promise.all([
        api.get('/user/applications'),
        api.get('/user/saved-jobs')
      ]);
      if (appsRes.success) {
        const applied = (appsRes.data.applications || []).some(a => a.job_id === parseInt(id));
        setHasApplied(applied);
      }
      if (savedRes.success) {
        const saved = (savedRes.data.saved_jobs || []).some(s => s.job_id === parseInt(id));
        setIsSaved(saved);
      }
    } catch (e) {}
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyMsg({ type: '', text: '' });
    try {
      const res = await api.post(`/jobs/${id}/apply`, {
        cover_letter: coverLetter,
        expected_salary: expectedSalary,
        notice_period: noticePeriod
      });
      if (res.success) {
        setHasApplied(true);
        setIsApplying(false);
        alert("Application submitted successfully!");
      }
    } catch (err) {
      setApplyMsg({ type: 'danger', text: err.message });
    }
  };

  const handleSaveToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      if (isSaved) {
        await api.delete(`/user/saved-jobs/${id}`);
        setIsSaved(false);
      } else {
        await api.post('/user/saved-jobs', { job_id: parseInt(id) });
        setIsSaved(true);
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason) return;
    try {
      const res = await api.post('/user/report', { job_id: parseInt(id), reason: reportReason });
      if (res.success) {
        setIsReporting(false);
        setReportReason('');
        alert("Report submitted successfully. Our team will review this listing.");
      }
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem', color: '#64748b' }}>Loading job specifications...</div>;
  }

  if (!job) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }} className="card">
        <h2>Job Posting Not Found</h2>
        <p className="text-muted" style={{ margin: '1rem 0' }}>This position may have been closed or removed by the employer.</p>
        <Link to="/jobs" className="btn btn-primary">Browse Other Jobs</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1rem' }}>
      {/* Header Banner Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '12px', backgroundColor: '#f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
            }}>
              {job.company?.logo ? (
                <img src={`http://127.0.0.1:5000${job.company.logo}`} alt={job.company.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Building2 size={36} style={{ color: '#4f46e5' }} />
              )}
            </div>
            <div>
              <h1 className="heading-lg" style={{ marginBottom: '0.25rem' }}>{job.title}</h1>
              <div style={{ fontSize: '1rem', color: '#4f46e5', fontWeight: 600 }}>
                <Link to={`/companies/${job.company_id}`}>{job.company?.name || 'Company Profile'}</Link>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={handleSaveToggle} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bookmark size={18} fill={isSaved ? '#f59e0b' : 'none'} color={isSaved ? '#f59e0b' : 'currentColor'} />
              {isSaved ? 'Saved' : 'Save'}
            </button>

            {user?.role === 'USER' ? (
              hasApplied ? (
                <button disabled className="btn btn-success" style={{ cursor: 'default', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={18} /> Applied
                </button>
              ) : (
                <button onClick={() => setIsApplying(true)} className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Send size={18} /> Apply Now
                </button>
              )
            ) : user ? (
              <div style={{ fontSize: '0.875rem', color: '#64748b', fontStyle: 'italic' }}>
                Logged in as {user.role}
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary btn-lg">Login to Apply</Link>
            )}
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem',
          marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>LOCATION</div>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={16} style={{ color: '#4f46e5' }} /> {job.location}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>EXPERIENCE</div>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={16} style={{ color: '#0ea5e9' }} /> {job.experience_years}+ Years
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>SALARY PACKAGE</div>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <DollarSign size={16} style={{ color: '#10b981' }} />
              {job.salary_min && job.salary_max ? `₹${(job.salary_min/100000).toFixed(1)}L - ₹${(job.salary_max/100000).toFixed(1)}L PA` : 'Competitive'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>WORK MODE</div>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Briefcase size={16} style={{ color: '#f59e0b' }} /> {job.work_type} • {job.employment_type}
            </div>
          </div>
        </div>
      </div>

      {/* Main Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        {/* Left Specification Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
            <h3 className="heading-md" style={{ marginBottom: '1rem' }}>Job Overview</h3>
            <p style={{ whiteSpace: 'pre-line', lineHeight: '1.7', color: '#334155' }}>
              {job.description}
            </p>
          </div>

          {job.responsibilities && (
            <div className="card">
              <h3 className="heading-md" style={{ marginBottom: '1rem' }}>Key Responsibilities</h3>
              <p style={{ whiteSpace: 'pre-line', lineHeight: '1.7', color: '#334155' }}>
                {job.responsibilities}
              </p>
            </div>
          )}

          {job.qualification && (
            <div className="card">
              <h3 className="heading-md" style={{ marginBottom: '1rem' }}>Qualifications & Requirements</h3>
              <p style={{ whiteSpace: 'pre-line', lineHeight: '1.7', color: '#334155' }}>
                {job.qualification}
              </p>
            </div>
          )}

          {job.skills && job.skills.length > 0 && (
            <div className="card">
              <h3 className="heading-md" style={{ marginBottom: '1rem' }}>Required Skills</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {job.skills.map((sk) => (
                  <span key={sk.id} style={{
                    padding: '0.375rem 0.875rem', borderRadius: '9999px', backgroundColor: '#eef2ff',
                    color: '#4f46e5', fontWeight: 600, fontSize: '0.875rem'
                  }}>
                    {sk.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Job Summary</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Posted Date:</span>
                <span style={{ fontWeight: 600 }}>{job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recently'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Openings:</span>
                <span style={{ fontWeight: 600 }}>{job.openings} Openings</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Deadline:</span>
                <span style={{ fontWeight: 600 }}>{job.deadline || 'Open until filled'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Applicants:</span>
                <span style={{ fontWeight: 600 }}>{job.applications_count} Candidates</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ backgroundColor: '#f8fafc' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>About Company</h4>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem', lineHeight: '1.5' }}>
              {job.company?.description || 'Leading enterprise offering high growth career opportunities.'}
            </p>
            <Link to={`/companies/${job.company_id}`} className="btn btn-outline btn-sm" style={{ width: '100%' }}>
              View Company Profile
            </Link>
          </div>

          {user?.role === 'USER' && (
            <button
              onClick={() => setIsReporting(true)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
            >
              <Flag size={14} /> Report suspicious listing
            </button>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      <Modal isOpen={isApplying} onClose={() => setIsApplying(false)} title={`Apply for ${job.title}`}>
        <form onSubmit={handleApplySubmit}>
          {applyMsg.text && (
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#ffe4e6', color: '#be123c', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {applyMsg.text}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Cover Letter / Note to HR</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Introduce yourself and explain why you're a great fit for this role..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Expected Salary (Annual)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. ₹12,000,000 INR"
              value={expectedSalary}
              onChange={(e) => setExpectedSalary(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notice Period</label>
            <select className="form-select" value={noticePeriod} onChange={(e) => setNoticePeriod(e.target.value)}>
              <option value="Immediate">Immediate Joiner</option>
              <option value="15 Days">15 Days</option>
              <option value="30 Days">30 Days</option>
              <option value="60 Days">60 Days</option>
              <option value="90 Days">90 Days</option>
            </select>
          </div>

          <div style={{ backgroundColor: '#f1f5f9', padding: '0.875rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#475569' }}>
            <strong>Note:</strong> Your saved candidate profile details, work history, skills, and PDF resume will be shared with the recruiter.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={() => setIsApplying(false)} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn btn-primary">Submit Application</button>
          </div>
        </form>
      </Modal>

      {/* Report Modal */}
      <Modal isOpen={isReporting} onClose={() => setIsReporting(false)} title="Report Job Listing">
        <form onSubmit={handleReportSubmit}>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
            Help us maintain a safe platform by reporting fake jobs, scams, or inaccurate information.
          </p>
          <div className="form-group">
            <label className="form-label">Reason for Report</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Describe the issue with this job posting..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={() => setIsReporting(false)} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn btn-danger">Submit Report</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default JobDetails;
