import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = '#4f46e5', subtitle }) => {
  return (
    <div className="stat-card">
      <div>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>{title}</div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>{value}</div>
        {subtitle && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{subtitle}</div>}
      </div>
      {Icon && (
        <div className="stat-icon" style={{ backgroundColor: `${color}15`, color }}>
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
