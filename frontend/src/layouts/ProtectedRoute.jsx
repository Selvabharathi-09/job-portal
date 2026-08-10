import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, token, loading, role } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="text-muted" style={{ fontWeight: 600 }}>Loading security credentials...</div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect user to their own role dashboard if trying to access unauthorized route
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'HR') return <Navigate to="/hr/dashboard" replace />;
    if (role === 'USER') return <Navigate to="/user/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
