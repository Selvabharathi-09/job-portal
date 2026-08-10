import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, FileText, Bookmark, Calendar, Bell, LogOut, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RoleSwitcher from '../components/RoleSwitcher';

const UserLayout = () => {
  const { user, unreadCount, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/user/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', path: '/user/profile', icon: User },
    { label: 'My Applications', path: '/user/applications', icon: FileText },
    { label: 'Saved Jobs', path: '/user/saved-jobs', icon: Bookmark },
    { label: 'Interviews', path: '/user/interviews', icon: Calendar },
    { label: 'Notifications', path: '/user/notifications', icon: Bell, badge: unreadCount },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <RoleSwitcher />
      <header className="navbar">
        <Link to="/" className="nav-brand">
          <Briefcase size={28} />
          <span>JobPortal</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#4f46e5',
              color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
            }}>
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user?.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Candidate</div>
            </div>
          </div>

          <button onClick={handleLogout} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

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

export default UserLayout;
