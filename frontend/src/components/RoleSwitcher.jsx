import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Building2, User, Eye, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RoleSwitcher = () => {
  const { user, role, login, logout } = useAuth();
  const navigate = useNavigate();

  const handleRoleSwitch = async (targetRole) => {
    try {
      if (targetRole === 'GUEST') {
        await logout();
        navigate('/');
        return;
      }

      let email = '';
      let password = '';
      if (targetRole === 'ADMIN') {
        email = 'admin@jobportal.com';
        password = 'Admin@123456';
      } else if (targetRole === 'HR') {
        email = 'hr@techcorp.com';
        password = 'HR@123456';
      } else if (targetRole === 'USER') {
        email = 'john.doe@example.com';
        password = 'User@123456';
      }

      const res = await login(email, password);
      if (res.success) {
        navigate(res.data.redirect);
      }
    } catch (err) {
      alert("Role switch error: " + err.message);
    }
  };

  return (
    <div style={{
      backgroundColor: '#0f172a', color: '#f8fafc', padding: '0.4rem 1.5rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
      fontSize: '0.75rem', fontWeight: 600, borderBottom: '1px solid #1e293b'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a5b4fc' }}>
        <Zap size={14} style={{ color: '#f59e0b' }} />
        <span>PRO DEMO ACCESS BAR:</span>
        <span style={{ color: '#94a3b8', fontWeight: 400 }}>Currently viewing as:</span>
        <span style={{ color: '#ffffff', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#312e81' }}>
          {user ? `${role} (${user.name})` : 'Public Guest'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
        <span style={{ color: '#64748b' }}>Switch View:</span>
        <button
          onClick={() => handleRoleSwitch('ADMIN')}
          style={{
            padding: '2px 10px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 700,
            backgroundColor: role === 'ADMIN' ? '#6366f1' : '#1e293b', color: role === 'ADMIN' ? '#ffffff' : '#cbd5e1',
            display: 'inline-flex', alignItems: 'center', gap: '4px'
          }}
        >
          <Shield size={12} /> Super Admin
        </button>
        <button
          onClick={() => handleRoleSwitch('HR')}
          style={{
            padding: '2px 10px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 700,
            backgroundColor: role === 'HR' ? '#0ea5e9' : '#1e293b', color: role === 'HR' ? '#ffffff' : '#cbd5e1',
            display: 'inline-flex', alignItems: 'center', gap: '4px'
          }}
        >
          <Building2 size={12} /> HR Recruiter
        </button>
        <button
          onClick={() => handleRoleSwitch('USER')}
          style={{
            padding: '2px 10px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 700,
            backgroundColor: role === 'USER' ? '#10b981' : '#1e293b', color: role === 'USER' ? '#ffffff' : '#cbd5e1',
            display: 'inline-flex', alignItems: 'center', gap: '4px'
          }}
        >
          <User size={12} /> Job Seeker
        </button>
        <button
          onClick={() => handleRoleSwitch('GUEST')}
          style={{
            padding: '2px 10px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 700,
            backgroundColor: !user ? '#f59e0b' : '#1e293b', color: !user ? '#ffffff' : '#cbd5e1',
            display: 'inline-flex', alignItems: 'center', gap: '4px'
          }}
        >
          <Eye size={12} /> Public Visitor
        </button>
      </div>
    </div>
  );
};

export default RoleSwitcher;
