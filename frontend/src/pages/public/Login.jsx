import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Lock, Mail, Shield, User, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate(res.data.redirect);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const setDemoCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@jobportal.com');
      setPassword('Admin@123456');
    } else if (role === 'hr') {
      setEmail('hr@techcorp.com');
      setPassword('HR@123456');
    } else if (role === 'user') {
      setEmail('john.doe@example.com');
      setPassword('User@123456');
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '54px', height: '54px', borderRadius: '50%', backgroundColor: '#eef2ff',
            color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
          }}>
            <Briefcase size={28} />
          </div>
          <h2 className="heading-md">Sign in to your Account</h2>
          <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Enter credentials to access your dashboard</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#ffe4e6', color: '#be123c', fontSize: '0.875rem', marginBottom: '1.25rem', fontWeight: 500 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 600 }}>Forgot password?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Quick Logins */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            Quick Demo Accounts
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button type="button" onClick={() => setDemoCredentials('admin')} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem', padding: '6px 4px' }}>
              <Shield size={12} /> Admin
            </button>
            <button type="button" onClick={() => setDemoCredentials('hr')} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem', padding: '6px 4px' }}>
              <Building2 size={12} /> HR
            </button>
            <button type="button" onClick={() => setDemoCredentials('user')} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem', padding: '6px 4px' }}>
              <User size={12} /> Candidate
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
          Don't have an account? <Link to="/register" style={{ color: '#4f46e5', fontWeight: 600 }}>Create account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
