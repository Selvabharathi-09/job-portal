import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Filter, RotateCcw } from 'lucide-react';
import api from '../../services/api';
import JobCard from '../../components/JobCard';
import { useAuth } from '../../context/AuthContext';

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const { user } = useAuth();

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('category_id') || '');
  const [workType, setWorkType] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  useEffect(() => {
    fetchCategories();
    if (user && user.role === 'USER') {
      fetchSavedJobs();
    }
  }, [user]);

  useEffect(() => {
    fetchJobs();
  }, [search, location, categoryId, workType, employmentType, minSalary, sortBy, page]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.success) setCategories(res.data.categories || []);
    } catch (e) {}
  };

  const fetchSavedJobs = async () => {
    try {
      const res = await api.get('/user/saved-jobs');
      if (res.success) {
        setSavedJobIds((res.data.saved_jobs || []).map(s => s.job_id));
      }
    } catch (e) {}
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (location) queryParams.append('location', location);
      if (categoryId) queryParams.append('category_id', categoryId);
      if (workType) queryParams.append('work_type', workType);
      if (employmentType) queryParams.append('employment_type', employmentType);
      if (minSalary) queryParams.append('min_salary', minSalary);
      if (sortBy) queryParams.append('sort_by', sortBy);
      queryParams.append('page', page);

      const res = await api.get(`/jobs?${queryParams.toString()}`);
      if (res.success) {
        setJobs(res.data.jobs || []);
        setTotalPages(res.data.pages || 1);
        setTotalJobs(res.data.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async (jobId) => {
    if (!user) {
      alert("Please login to save jobs");
      return;
    }
    try {
      if (savedJobIds.includes(jobId)) {
        await api.delete(`/user/saved-jobs/${jobId}`);
        setSavedJobIds(savedJobIds.filter(id => id !== jobId));
      } else {
        await api.post('/user/saved-jobs', { job_id: jobId });
        setSavedJobIds([...savedJobIds, jobId]);
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setLocation('');
    setCategoryId('');
    setWorkType('');
    setEmploymentType('');
    setMinSalary('');
    setSortBy('latest');
    setPage(1);
  };

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="heading-lg">Explore Job Opportunities</h1>
        <p className="text-muted">Discover roles matching your skills, experience, and career aspirations.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
        {/* Filter Sidebar */}
        <aside className="card" style={{ height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={18} /> Filters
            </h3>
            <button onClick={handleResetFilters} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Search Keywords</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Title or skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              className="form-input"
              placeholder="City or state..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Work Mode</label>
            <select className="form-select" value={workType} onChange={(e) => setWorkType(e.target.value)}>
              <option value="">All Modes</option>
              <option value="On-site">On-site</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Employment Type</label>
            <select className="form-select" value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}>
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Minimum Salary (LPA)</label>
            <select className="form-select" value={minSalary} onChange={(e) => setMinSalary(e.target.value)}>
              <option value="">Any Salary</option>
              <option value="500000">₹5 Lakhs+</option>
              <option value="1000000">₹10 Lakhs+</option>
              <option value="1500000">₹15 Lakhs+</option>
              <option value="2500000">₹25 Lakhs+</option>
            </select>
          </div>
        </aside>

        {/* Jobs Main Column */}
        <div>
          {/* Top Control Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', backgroundColor: '#ffffff', padding: '0.875rem 1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>
              Showing <strong style={{ color: '#0f172a' }}>{totalJobs}</strong> jobs available
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>Sort by:</span>
              <select className="form-select" style={{ padding: '0.375rem 0.75rem', width: 'auto' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="latest">Latest</option>
                <option value="salary_high">Salary: High to Low</option>
                <option value="salary_low">Salary: Low to High</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', fontWeight: 500 }}>Searching live job listings...</div>
          ) : jobs.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Jobs Found</h3>
              <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Try clearing filters or searching with different keywords.</p>
              <button onClick={handleResetFilters} className="btn btn-primary">Reset Filters</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onSave={handleSaveJob}
                  isSaved={savedJobIds.includes(job.id)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="btn btn-outline btn-sm"
              >
                Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', fontSize: '0.875rem', fontWeight: 600 }}>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="btn btn-outline btn-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
