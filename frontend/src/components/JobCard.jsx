import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, DollarSign, Clock, Building2, Bookmark } from 'lucide-react';
import StatusBadge from './StatusBadge';

const JobCard = ({ job, onSave, isSaved }) => {
  const formatSalary = (min, max) => {
    if (!min && !max) return 'Negotiable';
    if (min && max) return `₹${(min / 100000).toFixed(1)}L - ₹${(max / 100000).toFixed(1)}L PA`;
    return min ? `From ₹${(min / 100000).toFixed(1)}L` : `Up to ₹${(max / 100000).toFixed(1)}L`;
  };

  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
            }}>
              {job.company?.logo ? (
                <img src={`http://127.0.0.1:5000${job.company.logo}`} alt={job.company.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Building2 size={24} style={{ color: '#64748b' }} />
              )}
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.125rem' }}>
                <Link to={`/jobs/${job.id}`} style={{ color: 'inherit' }}>{job.title}</Link>
              </h3>
              <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>
                {job.company?.name || 'Enterprise'}
              </div>
            </div>
          </div>

          {onSave && (
            <button
              onClick={() => onSave(job.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: isSaved ? '#f59e0b' : '#94a3b8' }}
              title={isSaved ? "Saved" : "Save Job"}
            >
              <Bookmark size={20} fill={isSaved ? '#f59e0b' : 'none'} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.875rem', color: '#475569', marginBottom: '1rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={16} style={{ color: '#4f46e5' }} /> {job.location}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Briefcase size={16} style={{ color: '#0ea5e9' }} /> {job.work_type} • {job.employment_type}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <DollarSign size={16} style={{ color: '#10b981' }} /> {formatSalary(job.salary_min, job.salary_max)}
          </span>
        </div>

        <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1rem' }}>
          {job.description}
        </p>

        {job.skills && job.skills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem' }}>
            {job.skills.slice(0, 4).map((sk) => (
              <span key={sk.id} style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 500 }}>
                {sk.name}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>+{job.skills.length - 4} more</span>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={14} /> Exp: {job.experience_years}+ yrs
        </span>
        <Link to={`/jobs/${job.id}`} className="btn btn-primary btn-sm">
          View & Apply
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
