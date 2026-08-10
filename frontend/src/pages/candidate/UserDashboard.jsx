import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle2, Calendar, Bookmark, Briefcase, User, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

const UserDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, appsRes] = await Promise.all([
        api.get('/user/dashboard'),
        api.get('/user/applications')
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (appsRes.success) setRecentApps((appsRes.data.applications || []).slice(0, 5));
    } catch (err) {
      console.error("Dashboard error", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading candidate dashboard...</div>;

  return (
    <div>
      {/* Header Banner */}
      <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#eef2ff', borderColor: '#c7d2fe' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="heading-lg" style={{ color: '#312e81' }}>Welcome back, {user?.name}! 👋</h1>
            <p style={{ color: '#4338ca', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Track your active job applications, scheduled interviews, and saved roles.
            </p>
          </div>
          <Link to="/jobs" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Briefcase size={18} /> Search New Jobs
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        <StatCard title="Applications Submitted" value={stats?.total_applications || 0} icon={FileText} color="#4f46e5" />
        <StatCard title="Shortlisted / Selected" value={stats?.shortlisted || 0} icon={CheckCircle2} color="#10b981" />
        <StatCard title="Interviews Scheduled" value={stats?.interviews || 0} icon={Calendar} color="#0ea5e9" />
        <StatCard title="Saved Jobs" value={stats?.saved_jobs || 0} icon={Bookmark} color="#f59e0b" />
      </div>

      {/* Recent Applications Table */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 className="heading-md">Recent Applications</h2>
          <Link to="/user/applications" style={{ color: '#4f46e5', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {recentApps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <p style={{ marginBottom: '1rem' }}>You haven't submitted any job applications yet.</p>
            <Link to="/jobs" className="btn btn-primary btn-sm">Explore Openings</Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentApps.map((app) => (
                  <tr key={app.id}>
                    <td style={{ fontWeight: 600 }}>{app.job?.title || 'Position'}</td>
                    <td>{app.job?.company?.name || 'Company'}</td>
                    <td style={{ color: '#64748b' }}>{app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td><StatusBadge status={app.status} /></td>
                    <td>
                      <Link to={`/jobs/${app.job_id}`} className="btn btn-outline btn-sm">
                        View Job
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
