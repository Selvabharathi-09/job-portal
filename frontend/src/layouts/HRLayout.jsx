import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, Building2, PlusCircle, Briefcase, Users, Calendar, Bell, LogOut, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RoleSwitcher from '../components/RoleSwitcher';

const HRLayout = () => {
  const { user, unreadCount, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'HR Dashboard', path: '/hr/dashboard', icon: LayoutDashboard },
    { label: 'HR Profile', path: '/hr/profile', icon: User },
    { label: 'Company Profile', path: '/hr/company', icon: Building2 },
    { label: 'Post New Job', path: '/hr/jobs/create', icon: PlusCircle },
    { label: 'Manage Jobs', path: '/hr/jobs', icon: Briefcase },
    { label: 'Job Applicants', path: '/hr/applications', icon: Users },
    { label: 'Interviews', path: '/hr/interviews', icon: Calendar },
    { label: 'Notifications', path: '/hr/notifications', icon: Bell, badge: unreadCount },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <RoleSwitcher />
      <header className="navbar">
        <Link to="/" className="nav-brand">
          <Briefcase size={28} />
          <span>JobPortal <small style={{ fontSize: '0.75rem', opacity: 0.8, color: '#4f46e5' }}>(Recruiter Portal)</small></span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#0ea5e9',
              color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
            }}>
              {user?.name ? user.name[0].toUpperCase() : 'H'}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user?.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>HR Recruiter ({user?.status})</div>
            </div>
          </div>

          <button onClick={handleLogout} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Account Status Alert Banners */}
      {user?.status === 'pending' && (
        <div style={{
          backgroundColor: '#fef3c7', color: '#92400e', borderBottom: '1px solid #fde68a',
          padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', fontWeight: 600
        }}>
          <AlertTriangle size={20} />
          <span>Your HR account is waiting for Admin approval. Some recruitment features may be restricted until approval.</span>
        </div>
      )}

      <div className="app-container">
        <aside className="sidebar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                style={{ justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span style={{
                    backgroundColor: '#ef4444', color: '#ffffff', fontSize: '0.75rem',
                    padding: '2px 8px', borderRadius: '9999px', fontWeight: 700
                  }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </aside>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HRLayout;
