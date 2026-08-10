import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Briefcase, Search, Building2, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RoleSwitcher from '../components/RoleSwitcher';

const PublicLayout = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'HR') return '/hr/dashboard';
    return '/user/dashboard';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <RoleSwitcher />
      <header className="navbar">
        <Link to="/" className="nav-brand">
          <Briefcase size={28} />
          <span>JobPortal</span>
        </Link>

        <nav className="nav-links">
          <Link to="/jobs" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Search size={18} /> Jobs
          </Link>
          <Link to="/companies" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Building2 size={18} /> Companies
          </Link>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to={getDashboardPath()} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LayoutDashboard size={16} /> Dashboard ({role})
              </Link>
              <button onClick={handleLogout} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
        </nav>
      </header>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '3rem 2rem 1.5rem', borderTop: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontWeight: 800, fontSize: '1.25rem', marginBottom: '1rem' }}>
              <Briefcase size={24} style={{ color: '#6366f1' }} /> JobPortal
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
              Connecting top talent with leading enterprises worldwide. Build your career with confidence.
            </p>
          </div>
          <div>
            <h4 style={{ color: '#ffffff', marginBottom: '1rem', fontWeight: 600 }}>For Candidates</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <Link to="/jobs">Browse Jobs</Link>
              <Link to="/companies">Companies Directory</Link>
              <Link to="/register">Create Resume Profile</Link>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#ffffff', marginBottom: '1rem', fontWeight: 600 }}>For Employers</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <Link to="/register?role=hr">Post a Job</Link>
              <Link to="/login">HR Portal Login</Link>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '1200px', margin: '2rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid #1e293b', textAlign: 'center', fontSize: '0.875rem' }}>
          © {new Date().getFullYear()} JobPortal Platform Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
