import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';

const EditProfile = () => {
  const { user, refreshUser } = useAuth();
  const cand = user?.candidate_profile || {};

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(cand.phone || '');
  const [location, setLocation] = useState(cand.location || '');
  const [dob, setDob] = useState(cand.dob || '');
  const [about, setAbout] = useState(cand.about || '');
  const [expectedSalary, setExpectedSalary] = useState(cand.expected_salary || '');
  const [noticePeriod, setNoticePeriod] = useState(cand.notice_period || '30 Days');
  const [skillInput, setSkillInput] = useState('');

  const [photoFile, setPhotoFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  // Modals
  const [showEduModal, setShowEduModal] = useState(false);
  const [showExpModal, setShowExpModal] = useState(false);
  const [showProjModal, setShowProjModal] = useState(false);

  // Form states for modals
  const [eduDegree, setEduDegree] = useState('');
  const [eduInst, setEduInst] = useState('');
  const [eduSpec, setEduSpec] = useState('');
  const [eduStart, setEduStart] = useState('');
  const [eduEnd, setEduEnd] = useState('');
  const [eduScore, setEduScore] = useState('');

  const [expCompany, setExpCompany] = useState('');
  const [expTitle, setExpTitle] = useState('');
  const [expStart, setExpStart] = useState('');
  const [expEnd, setExpEnd] = useState('');
  const [expCurrent, setExpCurrent] = useState(false);
  const [expDesc, setExpDesc] = useState('');

  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projTech, setProjTech] = useState('');
  const [projGithub, setProjGithub] = useState('');
  const [projDemo, setProjDemo] = useState('');

  const navigate = useNavigate();

  const handleSavePersonalInfo = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('location', location);
      formData.append('dob', dob);
      formData.append('about', about);
      formData.append('expected_salary', expectedSalary);
      formData.append('notice_period', noticePeriod);
      if (photoFile) formData.append('profile_photo', photoFile);

      const res = await api.put('/user/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.success) {
        setMsg({ type: 'success', text: 'Personal details updated!' });
        await refreshUser();
      }
    } catch (err) {
      setMsg({ type: 'danger', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const res = await api.post('/user/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.success) {
        alert("Resume PDF uploaded successfully!");
        await refreshUser();
        setResumeFile(null);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    try {
      const res = await api.post('/user/skills', { skill_name: skillInput.trim() });
      if (res.success) {
        setSkillInput('');
        await refreshUser();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      await api.delete(`/user/skills/${skillId}`);
      await refreshUser();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddEducation = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/user/education', {
        degree: eduDegree,
        institution: eduInst,
        specialization: eduSpec,
        start_year: parseInt(eduStart) || null,
        end_year: parseInt(eduEnd) || null,
        score: eduScore
      });
      if (res.success) {
        setShowEduModal(false);
        setEduDegree(''); setEduInst(''); setEduSpec(''); setEduStart(''); setEduEnd(''); setEduScore('');
        await refreshUser();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteEducation = async (id) => {
    if (!window.confirm("Delete this education record?")) return;
    try {
      await api.delete(`/user/education/${id}`);
      await refreshUser();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddExperience = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/user/experience', {
        company: expCompany,
        title: expTitle,
        start_date: expStart,
        end_date: expEnd,
        is_current: expCurrent,
        description: expDesc
      });
      if (res.success) {
        setShowExpModal(false);
        setExpCompany(''); setExpTitle(''); setExpStart(''); setExpEnd(''); setExpCurrent(false); setExpDesc('');
        await refreshUser();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteExperience = async (id) => {
    if (!window.confirm("Delete this experience record?")) return;
    try {
      await api.delete(`/user/experience/${id}`);
      await refreshUser();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/user/projects', {
        title: projTitle,
        description: projDesc,
        technologies: projTech,
        github_link: projGithub,
        demo_link: projDemo
      });
      if (res.success) {
        setShowProjModal(false);
        setProjTitle(''); setProjDesc(''); setProjTech(''); setProjGithub(''); setProjDemo('');
        await refreshUser();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await api.delete(`/user/projects/${id}`);
      await refreshUser();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 className="heading-lg">Edit Candidate Profile</h1>
        <button onClick={() => navigate('/user/profile')} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ArrowLeft size={16} /> Back to Profile
        </button>
      </div>

      {msg.text && (
        <div style={{ padding: '0.875rem', borderRadius: '0.5rem', backgroundColor: msg.type === 'success' ? '#dcfce7' : '#ffe4e6', color: msg.type === 'success' ? '#15803d' : '#be123c', fontWeight: 600 }}>
          {msg.text}
        </div>
      )}

      {/* Personal Info Form */}
      <form onSubmit={handleSavePersonalInfo} className="card">
        <h3 className="heading-md" style={{ marginBottom: '1.25rem' }}>Personal Information</h3>

        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input type="text" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Location (City, Country)</label>
            <input type="text" className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Expected Salary (Annual)</label>
            <input type="text" className="form-input" placeholder="e.g. ₹12,000,000" value={expectedSalary} onChange={(e) => setExpectedSalary(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Notice Period</label>
            <select className="form-select" value={noticePeriod} onChange={(e) => setNoticePeriod(e.target.value)}>
              <option value="Immediate">Immediate Joiner</option>
              <option value="15 Days">15 Days</option>
              <option value="30 Days">30 Days</option>
              <option value="60 Days">60 Days</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">About Me / Summary</label>
          <textarea className="form-textarea" rows={3} value={about} onChange={(e) => setAbout(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Upload Profile Photo</label>
          <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} />
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '1rem' }}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Personal Details'}
        </button>
      </form>

      {/* Resume PDF Upload */}
      <form onSubmit={handleResumeUpload} className="card">
        <h3 className="heading-md" style={{ marginBottom: '1rem' }}>Resume PDF Upload</h3>
        <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
          Current Resume: {cand.resume_path ? <strong style={{ color: '#10b981' }}>Uploaded ({cand.resume_path.split('/').pop()})</strong> : <span style={{ color: '#ef4444' }}>Not uploaded</span>}
        </p>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files[0])} required />
          <button type="submit" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Upload size={16} /> Upload Resume
          </button>
        </div>
      </form>

      {/* Skills Manager */}
      <div className="card">
        <h3 className="heading-md" style={{ marginBottom: '1rem' }}>Skills</h3>
        <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Add a skill e.g. React.js, Python, Flask..."
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>Add Skill</button>
        </form>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {cand.skills?.map((sk) => (
            <span key={sk.id} style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.375rem 0.75rem',
              borderRadius: '9999px', backgroundColor: '#eef2ff', color: '#4f46e5', fontWeight: 600, fontSize: '0.875rem'
            }}>
              {sk.name}
              <button type="button" onClick={() => handleDeleteSkill(sk.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>×</button>
            </span>
          ))}
        </div>
      </div>

      {/* Experience Manager */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 className="heading-md">Work Experience</h3>
          <button type="button" onClick={() => setShowExpModal(true)} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Plus size={16} /> Add Experience
          </button>
        </div>

        {cand.experiences?.map((exp) => (
          <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <h4 style={{ fontWeight: 700 }}>{exp.title}</h4>
              <div style={{ color: '#4f46e5', fontSize: '0.875rem' }}>{exp.company}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}</div>
            </div>
            <button onClick={() => handleDeleteExperience(exp.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Education Manager */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 className="heading-md">Education</h3>
          <button type="button" onClick={() => setShowEduModal(true)} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Plus size={16} /> Add Education
          </button>
        </div>

        {cand.educations?.map((edu) => (
          <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <h4 style={{ fontWeight: 700 }}>{edu.degree}</h4>
              <div style={{ color: '#64748b', fontSize: '0.875rem' }}>{edu.institution}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Years: {edu.start_year} - {edu.end_year}</div>
            </div>
            <button onClick={() => handleDeleteEducation(edu.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Projects Manager */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 className="heading-md">Projects</h3>
          <button type="button" onClick={() => setShowProjModal(true)} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Plus size={16} /> Add Project
          </button>
        </div>

        {cand.projects?.map((proj) => (
          <div key={proj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <h4 style={{ fontWeight: 700 }}>{proj.title}</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{proj.description}</p>
            </div>
            <button onClick={() => handleDeleteProject(proj.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Modal Education */}
      <Modal isOpen={showEduModal} onClose={() => setShowEduModal(false)} title="Add Education Record">
        <form onSubmit={handleAddEducation}>
          <div className="form-group">
            <label className="form-label">Degree</label>
            <input type="text" className="form-input" placeholder="e.g. B.Tech Computer Science" value={eduDegree} onChange={(e) => setEduDegree(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Institution / University</label>
            <input type="text" className="form-input" placeholder="e.g. IIT Delhi" value={eduInst} onChange={(e) => setEduInst(e.target.value)} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Start Year</label>
              <input type="number" className="form-input" placeholder="2018" value={eduStart} onChange={(e) => setEduStart(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">End Year</label>
              <input type="number" className="form-input" placeholder="2022" value={eduEnd} onChange={(e) => setEduEnd(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Percentage / CGPA</label>
            <input type="text" className="form-input" placeholder="8.5 CGPA" value={eduScore} onChange={(e) => setEduScore(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Save Education</button>
        </form>
      </Modal>

      {/* Modal Experience */}
      <Modal isOpen={showExpModal} onClose={() => setShowExpModal(false)} title="Add Work Experience">
        <form onSubmit={handleAddExperience}>
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input type="text" className="form-input" placeholder="e.g. TechCorp Solutions" value={expCompany} onChange={(e) => setExpCompany(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Job Title</label>
            <input type="text" className="form-input" placeholder="e.g. Software Engineer" value={expTitle} onChange={(e) => setExpTitle(e.target.value)} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input type="date" className="form-input" value={expStart} onChange={(e) => setExpStart(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input type="date" className="form-input" value={expEnd} onChange={(e) => setExpEnd(e.target.value)} disabled={expCurrent} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input type="checkbox" checked={expCurrent} onChange={(e) => setExpCurrent(e.target.checked)} /> I currently work here
            </label>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows={3} value={expDesc} onChange={(e) => setExpDesc(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Save Experience</button>
        </form>
      </Modal>

      {/* Modal Project */}
      <Modal isOpen={showProjModal} onClose={() => setShowProjModal(false)} title="Add Project">
        <form onSubmit={handleAddProject}>
          <div className="form-group">
            <label className="form-label">Project Title</label>
            <input type="text" className="form-input" placeholder="e.g. E-Commerce Platform" value={projTitle} onChange={(e) => setProjTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows={3} value={projDesc} onChange={(e) => setProjDesc(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Technologies Used</label>
            <input type="text" className="form-input" placeholder="React, Node.js, MongoDB" value={projTech} onChange={(e) => setProjTech(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">GitHub Repository Link</label>
              <input type="url" className="form-input" placeholder="https://github.com/..." value={projGithub} onChange={(e) => setProjGithub(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Live Demo Link</label>
              <input type="url" className="form-input" placeholder="https://demo.com" value={projDemo} onChange={(e) => setProjDemo(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Save Project</button>
        </form>
      </Modal>
    </div>
  );
};

export default EditProfile;
