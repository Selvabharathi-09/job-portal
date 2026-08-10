import React from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Edit3, GraduationCap, Briefcase, Code, ExternalLink, FileText, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MyProfile = () => {
  const { user } = useAuth();
  const cand = user?.candidate_profile || {};

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Profile Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{
              width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#4f46e5',
              color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800,
              overflow: 'hidden', border: '3px solid #e2e8f0'
            }}>
              {user?.profile_photo ? (
                <img src={`http://127.0.0.1:5000${user.profile_photo}`} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.name ? user.name[0].toUpperCase() : 'U'
              )}
            </div>

            <div>
              <h1 className="heading-lg" style={{ marginBottom: '0.25rem' }}>{user?.name}</h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', color: '#64748b', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={16} /> {user?.email}
                </span>
                {cand.phone && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={16} /> {cand.phone}
                  </span>
                )}
                {cand.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={16} /> {cand.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Link to="/user/profile/edit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Edit3 size={16} /> Edit Profile
          </Link>
        </div>

        {cand.about && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>About Me</h3>
            <p style={{ color: '#334155', lineHeight: '1.6', fontSize: '0.9rem' }}>{cand.about}</p>
          </div>
        )}
      </div>

      {/* Resume Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 className="heading-md" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={22} style={{ color: '#4f46e5' }} /> Resume PDF
            </h3>
            <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {cand.resume_path ? 'Your resume PDF is uploaded and ready for job applications.' : 'No resume uploaded yet.'}
            </p>
          </div>

          {cand.resume_path ? (
            <a
              href={`http://127.0.0.1:5000${cand.resume_path}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={16} /> View Resume
            </a>
          ) : (
            <Link to="/user/profile/edit" className="btn btn-secondary">Upload Resume PDF</Link>
          )}
        </div>
      </div>

      {/* Skills Section */}
      <div className="card">
        <h3 className="heading-md" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code size={22} style={{ color: '#0ea5e9' }} /> Technical & Professional Skills
        </h3>
        {(!cand.skills || cand.skills.length === 0) ? (
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>No skills added yet.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {cand.skills.map((sk) => (
              <span key={sk.id} style={{
                padding: '0.375rem 0.875rem', borderRadius: '9999px', backgroundColor: '#eef2ff',
                color: '#4f46e5', fontWeight: 600, fontSize: '0.875rem'
              }}>
                {sk.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Work Experience */}
      <div className="card">
        <h3 className="heading-md" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Briefcase size={22} style={{ color: '#10b981' }} /> Work Experience
        </h3>
        {(!cand.experiences || cand.experiences.length === 0) ? (
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>No experience records added.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {cand.experiences.map((exp) => (
              <div key={exp.id} style={{ borderLeft: '3px solid #10b981', paddingLeft: '1rem' }}>
                <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>{exp.title}</h4>
                <div style={{ fontWeight: 600, color: '#4f46e5', fontSize: '0.875rem' }}>{exp.company}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.25rem 0' }}>
                  {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
                </div>
                {exp.description && <p style={{ fontSize: '0.875rem', color: '#334155', marginTop: '0.25rem' }}>{exp.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Education */}
      <div className="card">
        <h3 className="heading-md" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GraduationCap size={22} style={{ color: '#f59e0b' }} /> Education
        </h3>
        {(!cand.educations || cand.educations.length === 0) ? (
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>No education details added.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {cand.educations.map((edu) => (
              <div key={edu.id} style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1rem' }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{edu.degree}</h4>
                <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>{edu.institution}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  Years: {edu.start_year} - {edu.end_year} • Score: {edu.score}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Projects */}
      <div className="card">
        <h3 className="heading-md" style={{ marginBottom: '1.25rem' }}>Personal Projects</h3>
        {(!cand.projects || cand.projects.length === 0) ? (
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>No projects added.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {cand.projects.map((p) => (
              <div key={p.id} style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1rem' }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.title}</h4>
                <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0.5rem 0' }}>{p.description}</p>
                {p.technologies && <div style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 600 }}>Tech: {p.technologies}</div>}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.8rem' }}>
                  {p.github_link && <a href={p.github_link} target="_blank" rel="noreferrer" style={{ color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '2px' }}>GitHub <ExternalLink size={12} /></a>}
                  {p.demo_link && <a href={p.demo_link} target="_blank" rel="noreferrer" style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px' }}>Live Demo <ExternalLink size={12} /></a>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
