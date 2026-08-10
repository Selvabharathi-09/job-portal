import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, FileText, Calendar, Download, Eye, ExternalLink, Filter } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';

const HRJobApplications = () => {
  const [searchParams] = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);

  // Interview Form
  const [ivDate, setIvDate] = useState('');
  const [ivTime, setIvTime] = useState('');
  const [ivType, setIvType] = useState('Online');
  const [ivLink, setIvLink] = useState('');
  const [ivNotes, setIvNotes] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [searchParams, statusFilter]);

  const fetchApplications = async () => {
    try {
      let url = '/hr/applications';
      const query = new URLSearchParams();
      if (searchParams.get('job_id')) query.append('job_id', searchParams.get('job_id'));
      if (statusFilter) query.append('status', statusFilter);
      if (query.toString()) url += `?${query.toString()}`;

      const res = await api.get(url);
      if (res.success) setApplications(res.data.applications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await api.put(`/hr/applications/${appId}/status`, { status: newStatus });
      if (res.success) {
        setApplications(applications.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const openCandidateProfile = (app) => {
    setSelectedApp(app);
    setSelectedCandidate(app.candidate);
    setShowProfileModal(true);
  };

  const openScheduleInterview = (app) => {
    setSelectedApp(app);
    setShowInterviewModal(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/hr/interviews', {
        application_id: selectedApp.id,
        scheduled_date: ivDate,
        scheduled_time: ivTime,
        interview_type: ivType,
        meeting_link: ivLink,
        notes: ivNotes
      });
      if (res.success) {
        alert("Interview scheduled successfully!");
        setShowInterviewModal(false);
        setIvDate(''); setIvTime(''); setIvLink(''); setIvNotes('');
        fetchApplications();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="heading-lg">Candidate Applications</h1>
          <p className="text-muted">Review job applicants, inspect PDF resumes, and schedule interviews</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>Filter Status:</span>
          <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Applications</option>
            <option value="Applied">Applied</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading applicant queue...</div>
      ) : applications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <Users size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
          <h3>No Candidates Found</h3>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>No applications received for the selected job position or status filter.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Candidate Name</th>
                <th>Applied Job</th>
                <th>Application Date</th>
                <th>Resume</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{app.candidate?.user_name || 'Candidate'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.candidate?.user_email}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{app.job?.title || 'Job Position'}</div>
                  </td>
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
                        <Download size={14} /> Resume PDF
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>No Resume</span>
                    )}
                  </td>
                  <td>
                    <select
                      className="form-select"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    >
                      <option value="Applied">Applied</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview Scheduled">Interview Scheduled</option>
                      <option value="Selected">Selected</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button onClick={() => openCandidateProfile(app)} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Eye size={14} /> Profile
                      </button>
                      <button onClick={() => openScheduleInterview(app)} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} /> Interview
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Candidate Profile Details Modal */}
      <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title="Candidate Profile Breakdown">
        {selectedCandidate && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedCandidate.user_name}</h3>
              <div style={{ color: '#64748b', fontSize: '0.875rem' }}>{selectedCandidate.user_email} • {selectedCandidate.phone || 'No phone'}</div>
              <div style={{ fontSize: '0.85rem', color: '#4f46e5', marginTop: '0.25rem' }}>Location: {selectedCandidate.location || 'Not specified'}</div>
            </div>

            {selectedCandidate.about && (
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '0.9rem' }}>About Candidate</h4>
                <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.5' }}>{selectedCandidate.about}</p>
              </div>
            )}

            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Skills</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {selectedCandidate.skills?.map((sk) => (
                  <span key={sk.id} style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '9999px', backgroundColor: '#eef2ff', color: '#4f46e5', fontWeight: 600 }}>
                    {sk.name}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Work History</h4>
              {selectedCandidate.experiences?.map((exp) => (
                <div key={exp.id} style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <strong>{exp.title}</strong> at {exp.company} ({exp.start_date} - {exp.end_date || 'Present'})
                </div>
              ))}
            </div>

            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Education</h4>
              {selectedCandidate.educations?.map((edu) => (
                <div key={edu.id} style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <strong>{edu.degree}</strong>, {edu.institution} ({edu.start_year} - {edu.end_year})
                </div>
              ))}
            </div>

            {selectedApp?.cover_letter && (
              <div style={{ backgroundColor: '#f8fafc', padding: '0.875rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>Cover Letter Note:</h4>
                <p style={{ fontSize: '0.85rem', color: '#475569', fontStyle: 'italic', marginTop: '0.25rem' }}>{selectedApp.cover_letter}</p>
              </div>
            )}

            {selectedCandidate.resume_path && (
              <a
                href={`http://127.0.0.1:5000${selectedCandidate.resume_path}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ textAlign: 'center', marginTop: '0.5rem' }}
              >
                <Download size={16} /> Open Candidate Resume PDF
              </a>
            )}
          </div>
        )}
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal isOpen={showInterviewModal} onClose={() => setShowInterviewModal(false)} title="Schedule Candidate Interview">
        <form onSubmit={handleScheduleSubmit}>
          <div className="form-group">
            <label className="form-label">Candidate</label>
            <input type="text" className="form-input" value={selectedApp?.candidate?.user_name || ''} disabled style={{ backgroundColor: '#f1f5f9' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Interview Date *</label>
              <input type="date" className="form-input" value={ivDate} onChange={(e) => setIvDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Interview Time *</label>
              <input type="time" className="form-input" value={ivTime} onChange={(e) => setIvTime(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Interview Type</label>
            <select className="form-select" value={ivType} onChange={(e) => setIvType(e.target.value)}>
              <option value="Online">Online Video Call</option>
              <option value="Phone">Phone Screen</option>
              <option value="In-person">In-person Office Visit</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Meeting Link (Google Meet / Zoom)</label>
            <input type="url" className="form-input" placeholder="https://meet.google.com/..." value={ivLink} onChange={(e) => setIvLink(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Notes for Candidate</label>
            <textarea className="form-textarea" rows={3} placeholder="Provide instructions, preparation topics..." value={ivNotes} onChange={(e) => setIvNotes(e.target.value)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" onClick={() => setShowInterviewModal(false)} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn btn-primary">Confirm & Notify Candidate</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HRJobApplications;
