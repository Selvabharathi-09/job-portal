import React, { useState, useEffect } from 'react';
import { Search, Shield, Trash2, Eye, Download } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/admin/users?search=${encodeURIComponent(search)}`);
      if (res.success) setUsers(res.data.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'deactivated' : 'active';
    try {
      const res = await api.put(`/admin/users/${user.id}/status`, { status: newStatus });
      if (res.success) {
        setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this candidate account?")) return;
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.success) {
        setUsers(users.filter(u => u.id !== userId));
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const openProfileModal = (user) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="heading-lg">Job Seeker Candidates</h1>
          <p className="text-muted">Manage candidate user accounts and status</p>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search candidate name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading candidate accounts...</div>
      ) : users.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <h3>No Candidates Found</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Email</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 700 }}>{u.name}</td>
                  <td style={{ color: '#64748b' }}>{u.email}</td>
                  <td><StatusBadge status={u.status} /></td>
                  <td style={{ color: '#64748b' }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button onClick={() => openProfileModal(u)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Eye size={14} /> Profile
                      </button>

                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`btn btn-sm ${u.status === 'active' ? 'btn-outline' : 'btn-success'}`}
                      >
                        {u.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>

                      <button onClick={() => handleDeleteUser(u.id)} className="btn btn-danger btn-sm">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Candidate Details Modal */}
      <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title="Candidate User Profile">
        {selectedUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedUser.name}</h3>
              <div style={{ color: '#64748b' }}>{selectedUser.email}</div>
            </div>

            {selectedUser.candidate_profile && (
              <div style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
                <div><strong>Phone:</strong> {selectedUser.candidate_profile.phone || 'Not provided'}</div>
                <div><strong>Location:</strong> {selectedUser.candidate_profile.location || 'Not provided'}</div>
                <div><strong>About:</strong> {selectedUser.candidate_profile.about || 'None'}</div>

                {selectedUser.candidate_profile.resume_path && (
                  <a
                    href={`http://127.0.0.1:5000${selectedUser.candidate_profile.resume_path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Download size={14} /> Download Resume PDF
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminUsers;
