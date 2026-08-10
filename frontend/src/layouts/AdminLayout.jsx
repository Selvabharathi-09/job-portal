import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserCheck, Building2, Briefcase, FileText, Flag, Tags, ShieldAlert, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RoleSwitcher from '../components/RoleSwitcher';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Admin Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Candidate Users', path: '/admin/users', icon: Users },
    { label: 'HR Approvals', path: '/admin/hrs', icon: UserCheck },
    { label: 'Companies', path: '/admin/companies', icon: Building2 },
    { label: 'Job Approvals', path: '/admin/jobs', icon: Briefcase },
    { label: 'All Applications', path: '/admin/applications', icon: FileText },
    { label: 'User Reports', path: '/admin/reports', icon: Flag },
    { label: 'Categories & Taxonomies', path: '/admin/taxonomies', icon: Tags },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <RoleSwitcher />
      <header className="navbar" style={{ backgroundColor: '#0f172a', color: '#ffffff', borderBottom: '1px solid #1e293b' }}>
        <Link to="/admin/dashboard" className="nav-brand" style={{ color: '#ffffff' }}>
          <Shield size={28} style={{ color: '#6366f1' }} />
          <span>JobPortal <small style={{ fontSize: '0.75rem', color: '#a5b4fc' }}>(Super Admin)</small></span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#6366f1',
              color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800
            }}>
              A
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#ffffff' }}>{user?.name || 'Super Admin'}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>System Administrator</div>
            </div>
          </div>

          <button onClick={handleLogout} className="btn btn-outline btn-sm" style={{ color: '#ffffff', borderColor: '#334155' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <div className="app-container">
        <aside className="sidebar" style={{ backgroundColor: '#1e293b', borderRight: '1px solid #334155' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                style={{
                  color: isActive ? '#ffffff' : '#94a3b8',
                  backgroundColor: isActive ? '#312e81' : 'transparent'
                }}
              >
                <Icon size={18} style={{ color: isActive ? '#818cf8' : '#94a3b8' }} />
                <span>{item.label}</span>
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

export default AdminLayout;
