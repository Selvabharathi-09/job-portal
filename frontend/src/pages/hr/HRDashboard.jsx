import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, CheckCircle2, Calendar, PlusCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';

const HRDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/hr/stats');
      if (res.success) setStats(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading HR analytics...</div>;

  const chartData = [
    { name: 'Total Apps', count: stats?.total_applications || 0, color: '#4f46e5' },
    { name: 'Shortlisted', count: stats?.shortlisted || 0, color: '#10b981' },
    { name: 'Interviews', count: stats?.interviews_scheduled || 0, color: '#0ea5e9' },
    { name: 'Selected', count: stats?.selected || 0, color: '#059669' },
    { name: 'Rejected', count: stats?.rejected || 0, color: '#ef4444' },
  ];

  return (
    <div>
      {/* Header Banner */}
      <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#e0f2fe', borderColor: '#bae6fd' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="heading-lg" style={{ color: '#0369a1' }}>Recruiter Command Center</h1>
            <p style={{ color: '#0284c7', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Company: {user?.hr_profile?.company?.name || 'Company Profile'}
            </p>
          </div>
          <Link to="/hr/jobs/create" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PlusCircle size={18} /> Post New Job Position
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        <StatCard title="Active Jobs" value={stats?.active_jobs || 0} icon={Briefcase} color="#10b981" subtitle={`${stats?.pending_jobs || 0} pending admin approval`} />
        <StatCard title="Total Applications" value={stats?.total_applications || 0} icon={Users} color="#4f46e5" subtitle={`${stats?.new_applications || 0} new applications`} />
        <StatCard title="Shortlisted Candidates" value={stats?.shortlisted || 0} icon={CheckCircle2} color="#0ea5e9" />
        <StatCard title="Interviews Scheduled" value={stats?.interviews_scheduled || 0} icon={Calendar} color="#f59e0b" />
      </div>

      {/* Recruitment Funnel Chart */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 className="heading-md" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={20} style={{ color: '#4f46e5' }} /> Candidate Recruitment Pipeline Breakdown
        </h2>

        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
