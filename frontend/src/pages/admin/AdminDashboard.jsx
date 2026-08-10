import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, Building2, Briefcase, FileText, Flag, ShieldAlert, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.success) setStats(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading Super Admin statistics...</div>;

  return (
    <div>
      {/* Header Banner */}
      <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#312e81', color: '#ffffff', borderColor: '#4338ca' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="heading-lg" style={{ color: '#ffffff' }}>Super Admin Control Panel</h1>
            <p style={{ color: '#c7d2fe', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Full system control over users, HR approvals, job moderation, reports, and security audit logs.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/admin/hrs" className="btn btn-secondary btn-sm" style={{ backgroundColor: '#ffffff', color: '#312e81' }}>
              Pending HRs ({stats?.pending_hrs || 0})
            </Link>
            <Link to="/admin/jobs" className="btn btn-secondary btn-sm" style={{ backgroundColor: '#818cf8', color: '#ffffff' }}>
              Pending Jobs ({stats?.pending_jobs || 0})
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        <StatCard title="Candidate Job Seekers" value={stats?.total_users || 0} icon={Users} color="#4f46e5" />
        <StatCard title="HR Accounts" value={stats?.total_hrs || 0} icon={UserCheck} color="#0ea5e9" subtitle={`${stats?.pending_hrs || 0} pending review`} />
        <StatCard title="Total Companies" value={stats?.total_companies || 0} icon={Building2} color="#10b981" />
        <StatCard title="Total Jobs Posted" value={stats?.total_jobs || 0} icon={Briefcase} color="#f59e0b" subtitle={`${stats?.active_jobs || 0} published live`} />
        <StatCard title="Applications Submitted" value={stats?.total_applications || 0} icon={FileText} color="#6366f1" />
        <StatCard title="Pending Reports" value={stats?.pending_reports || 0} icon={Flag} color="#ef4444" />
      </div>

      {/* Action Quick Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 className="heading-md">HR Approvals Queue</h3>
            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '9999px', backgroundColor: '#fef3c7', color: '#b45309', fontWeight: 700 }}>
              {stats?.pending_hrs || 0} Action Required
            </span>
          </div>
          <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Review new HR recruiter registration requests before granting recruitment access.
          </p>
          <Link to="/admin/hrs" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            Manage HR Accounts <ArrowRight size={16} />
          </Link>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 className="heading-md">Job Post Moderation</h3>
            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '9999px', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
              {stats?.pending_jobs || 0} Jobs Pending
            </span>
          </div>
          <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Approve or reject job positions created by HR recruiters before public listing.
          </p>
          <Link to="/admin/jobs" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            Review Pending Jobs <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
