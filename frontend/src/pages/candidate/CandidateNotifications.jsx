import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CandidateNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fetchNotifications } = useAuth();

  useEffect(() => {
    loadNotifs();
  }, []);

  const loadNotifs = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.success) setNotifications(res.data.notifications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      fetchNotifications();
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      fetchNotifications();
    } catch (e) {}
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 className="heading-lg">Notifications</h1>
          <p className="text-muted">In-app notifications for status updates and schedules</p>
        </div>
        {notifications.some(n => !n.is_read) && (
          <button onClick={handleMarkAllRead} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCheck size={16} /> Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <Bell size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
          <h3>No Notifications</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              className="card"
              style={{
                backgroundColor: n.is_read ? '#ffffff' : '#eef2ff',
                borderColor: n.is_read ? '#e2e8f0' : '#c7d2fe',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '1.25rem'
              }}
            >
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', marginBottom: '0.25rem' }}>{n.title}</h4>
                <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: '1.5' }}>{n.message}</p>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                  {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
                </div>
              </div>
              {!n.is_read && (
                <button onClick={() => handleMarkRead(n.id)} className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateNotifications;
