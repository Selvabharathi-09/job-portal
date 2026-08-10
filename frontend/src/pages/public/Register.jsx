import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Building2, Mail, Lock, Phone, MapPin, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(searchParams.get('role') === 'hr' ? 'HR' : 'USER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  
  // HR Specific
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [industry, setIndustry] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const payload = {
        name,
        email,
        password,
        role,
        phone,
        location,
        company_name: companyName,
        company_website: companyWebsite,
        industry
      };

      const res = await register(payload);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1rem' }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 className="heading-md">Create Your Account</h2>
          <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Join JobPortal to explore or hire talent</p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => setRole('USER')}
            style={{
              padding: '0.5rem', border: 'none', borderRadius: '0.375rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
              backgroundColor: role === 'USER' ? '#ffffff' : 'transparent', color: role === 'USER' ? '#4f46e5' : '#64748b',
              boxShadow: role === 'USER' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            <User size={16} /> Job Seeker
          </button>
          <button
            type="button"
            onClick={() => setRole('HR')}
            style={{
              padding: '0.5rem', border: 'none', borderRadius: '0.375rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
              backgroundColor: role === 'HR' ? '#ffffff' : 'transparent', color: role === 'HR' ? '#4f46e5' : '#64748b',
              boxShadow: role === 'HR' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            <Building2 size={16} /> HR / Employer
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#ffe4e6', color: '#be123c', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#dcfce7', color: '#15803d', fontSize: '0.875rem', marginBottom: '1.25rem', fontWeight: 600 }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{role === 'HR' ? 'HR Recruiter Name' : 'Full Name'}</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Sarah Jenkins"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Minimum 6 characters..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="City, State"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* HR Additional Fields */}
          {role === 'HR' && (
            <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. TechCorp Solutions"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Industry</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. IT Services"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Company Website</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://example.com"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '0.625rem', borderRadius: '0.375rem', fontSize: '0.75rem', marginBottom: '1rem' }}>
                <strong>Note:</strong> HR accounts require Admin review and approval before recruitment tools are activated.
              </div>
            </div>
          )}

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            {submitting ? 'Creating Account...' : `Register as ${role === 'HR' ? 'HR Recruiter' : 'Job Seeker'}`}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
          Already have an account? <Link to="/login" style={{ color: '#4f46e5', fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
