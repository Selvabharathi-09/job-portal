import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Plus, ArrowLeft } from 'lucide-react';
import api from '../../services/api';

const CreateEditJob = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [qualification, setQualification] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [location, setLocation] = useState('');
  const [workType, setWorkType] = useState('On-site');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [openings, setOpenings] = useState(1);
  const [deadline, setDeadline] = useState('');
  const [jobStatus, setJobStatus] = useState('published');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);

  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    if (isEdit) fetchJobDetails();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.success) setCategories(res.data.categories || []);
    } catch (e) {}
  };

  const fetchJobDetails = async () => {
    try {
      const res = await api.get(`/jobs/${id}`);
      if (res.success && res.data.job) {
        const j = res.data.job;
        setTitle(j.title || '');
        setCategoryId(j.category_id || '');
        setDescription(j.description || '');
        setResponsibilities(j.responsibilities || '');
        setQualification(j.qualification || '');
        setExperienceYears(j.experience_years || 0);
        setSalaryMin(j.salary_min || '');
        setSalaryMax(j.salary_max || '');
        setLocation(j.location || '');
        setWorkType(j.work_type || 'On-site');
        setEmploymentType(j.employment_type || 'Full-time');
        setOpenings(j.openings || 1);
        setDeadline(j.deadline || '');
        setJobStatus(j.status || 'published');
        setSkills((j.skills || []).map(s => s.name));
      }
    } catch (e) {}
  };

  const handleAddSkillTag = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkillTag = (tag) => {
    setSkills(skills.filter(s => s !== tag));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        title,
        category_id: parseInt(categoryId) || null,
        description,
        responsibilities,
        qualification,
        experience_years: parseInt(experienceYears) || 0,
        salary_min: parseInt(salaryMin) || null,
        salary_max: parseInt(salaryMax) || null,
        location,
        work_type: workType,
        employment_type: employmentType,
        openings: parseInt(openings) || 1,
        deadline,
        status: jobStatus,
        skills
      };

      let res;
      if (isEdit) {
        res = await api.put(`/hr/jobs/${id}`, payload);
      } else {
        res = await api.post('/hr/jobs', payload);
      }

      if (res.success) {
        alert(isEdit ? "Job position updated!" : "Job position created and published successfully!");
        navigate('/hr/jobs');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 className="heading-lg">{isEdit ? 'Edit Job Position' : 'Create New Job Posting'}</h1>
        <button onClick={() => navigate('/hr/jobs')} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ArrowLeft size={16} /> Back to Jobs
        </button>
      </div>

      {error && (
        <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#ffe4e6', color: '#be123c', marginBottom: '1.25rem', fontWeight: 600 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label className="form-label">Job Title *</label>
          <input type="text" className="form-input" placeholder="e.g. Senior Full Stack Engineer" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Job Category</label>
            <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Location (City/State) *</label>
            <input type="text" className="form-input" placeholder="e.g. Bangalore" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Initial Status</label>
            <select className="form-select" value={jobStatus} onChange={(e) => setJobStatus(e.target.value)}>
              <option value="published">Publish Live</option>
              <option value="pending">Pending Approval</option>
              <option value="draft">Save Draft</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Work Mode</label>
            <select className="form-select" value={workType} onChange={(e) => setWorkType(e.target.value)}>
              <option value="On-site">On-site</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Employment Type</label>
            <select className="form-select" value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Required Exp (Years)</label>
            <input type="number" className="form-input" min="0" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Min Salary (Annual INR)</label>
            <input type="number" className="form-input" placeholder="e.g. 1000000" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Max Salary (Annual INR)</label>
            <input type="number" className="form-input" placeholder="e.g. 1800000" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Number of Openings</label>
            <input type="number" className="form-input" min="1" value={openings} onChange={(e) => setOpenings(e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Application Deadline</label>
          <input type="date" className="form-input" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Job Description *</label>
          <textarea className="form-textarea" rows={4} placeholder="Describe the role overview and scope..." value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>

        <div className="form-group">
          <label className="form-label">Key Responsibilities</label>
          <textarea className="form-textarea" rows={3} placeholder="Bulleted list of daily tasks & responsibilities..." value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Qualifications & Requirements</label>
          <textarea className="form-textarea" rows={3} placeholder="Educational degree, technical background requirements..." value={qualification} onChange={(e) => setQualification(e.target.value)} />
        </div>

        {/* Skill Tags */}
        <div className="form-group">
          <label className="form-label">Required Skills</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. React.js, Python, PostgreSQL..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
            />
            <button onClick={handleAddSkillTag} className="btn btn-outline" style={{ flexShrink: 0 }}>Add Skill</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {skills.map((tag, idx) => (
              <span key={idx} style={{
                padding: '4px 10px', borderRadius: '9999px', backgroundColor: '#eef2ff',
                color: '#4f46e5', fontWeight: 600, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px'
              }}>
                {tag}
                <button type="button" onClick={() => handleRemoveSkillTag(tag)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>×</button>
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" onClick={() => navigate('/hr/jobs')} className="btn btn-outline">Cancel</button>
          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Save size={16} /> {submitting ? 'Saving...' : isEdit ? 'Update Job Position' : 'Create Job Position'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEditJob;
