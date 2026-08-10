import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, MapPin, Building2 } from 'lucide-react';
import api from '../../services/api';

const CandidateInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const res = await api.get('/user/interviews');
      if (res.success) setInterviews(res.data.interviews || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="heading-lg">Scheduled Interviews</h1>
        <p className="text-muted">Review interview schedules, date, time, and meeting links</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading scheduled interviews...</div>
      ) : interviews.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <Calendar size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
          <h3>No Scheduled Interviews</h3>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>When HR recruiters schedule an interview, details will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {interviews.map((iv) => (
            <div key={iv.id} className="card" style={{ borderLeft: '4px solid #4f46e5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{iv.job_title}</h3>
                  <div style={{ color: '#4f46e5', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.25rem' }}>
                    <Building2 size={16} /> {iv.company_name}
                  </div>
                </div>
                <span className="badge badge-interview-scheduled">{iv.status}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', fontSize: '0.875rem' }}>
                <div>
                  <span className="text-muted">Date & Time:</span>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <Calendar size={16} style={{ color: '#4f46e5' }} /> {iv.scheduled_date} at {iv.scheduled_time}
                  </div>
                </div>
                <div>
                  <span className="text-muted">Type:</span>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <Video size={16} style={{ color: '#0ea5e9' }} /> {iv.interview_type}
                  </div>
                </div>
              </div>

              {iv.meeting_link && (
                <div style={{ marginTop: '1rem', backgroundColor: '#eef2ff', padding: '0.75rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#312e81' }}>Meeting Link:</span>
                  <a href={iv.meeting_link} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                    Join Meeting
                  </a>
                </div>
              )}

              {iv.notes && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#475569' }}>
                  <strong>HR Notes:</strong> {iv.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateInterviews;
