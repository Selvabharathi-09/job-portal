import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Building2, Users, ArrowRight, CheckCircle2, Award, Zap } from 'lucide-react';
import api from '../../services/api';
import JobCard from '../../components/JobCard';

const Home = () => {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [latestJobs, setLatestJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, catRes, compRes] = await Promise.all([
          api.get('/jobs?per_page=6'),
          api.get('/categories'),
          api.get('/companies')
        ]);
        if (jobsRes.success) setLatestJobs(jobsRes.data.jobs || []);
        if (catRes.success) setCategories(catRes.data.categories || []);
        if (compRes.success) setCompanies((compRes.data.companies || []).slice(0, 4));
      } catch (err) {
        console.error("Failed to load homepage data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${encodeURIComponent(search)}&location=${encodeURIComponent(location)}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
        color: '#ffffff', padding: '4rem 2rem 5rem', textAlign: 'center', position: 'relative'
      }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255, 255, 255, 0.15)',
            padding: '4px 14px', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem', backdropFilter: 'blur(4px)'
          }}>
            <Zap size={16} style={{ color: '#f59e0b' }} /> Over 10,000+ Active Jobs Posted
          </span>

          <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
            Find Your Next Career Opportunity
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#c7d2fe', marginBottom: '2.5rem', fontWeight: 400 }}>
            Connect with top hiring companies across Software, Engineering, Design, Finance, and Marketing.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} style={{
            backgroundColor: '#ffffff', borderRadius: '1rem', padding: '0.75rem',
            display: 'flex', flexWrap: 'wrap', gap: '0.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', color: '#0f172a'
          }}>
            <div style={{ flex: '1 1 240px', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRight: '1px solid #e2e8f0' }}>
              <Search size={20} style={{ color: '#64748b' }} />
              <input
                type="text"
                placeholder="Job title, skills, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem' }}
              />
            </div>

            <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem' }}>
              <MapPin size={20} style={{ color: '#64748b' }} />
              <input
                type="text"
                placeholder="City or Location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem' }}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ borderRadius: '0.75rem', flex: '0 0 auto' }}>
              Search Jobs
            </button>
          </form>

          {/* Stats Bar */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem',
            marginTop: '3.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>10,000+</div>
              <div style={{ fontSize: '0.875rem', color: '#a5b4fc' }}>Live Job Openings</div>
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>5,000+</div>
              <div style={{ fontSize: '0.875rem', color: '#a5b4fc' }}>Hiring Companies</div>
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>50,000+</div>
              <div style={{ fontSize: '0.875rem', color: '#a5b4fc' }}>Candidates Placed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 className="heading-lg">Popular Job Categories</h2>
          <p className="text-muted">Explore thousands of opportunities by specialization</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/jobs?category_id=${cat.id}`}
              className="card card-hover"
              style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}
            >
              <div style={{ width: '54px', height: '54px', borderRadius: '12px', backgroundColor: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Briefcase size={26} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{cat.name}</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Job Postings */}
      <section style={{ padding: '4rem 2rem', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
            <div>
              <h2 className="heading-lg">Latest Job Opportunities</h2>
              <p className="text-muted">Handpicked roles from top verified companies</p>
            </div>
            <Link to="/jobs" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              View All Jobs <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading latest opportunities...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {latestJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Companies */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 className="heading-lg">Featured Companies Hiring Now</h2>
          <p className="text-muted">Join top engineering teams and world class workplaces</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {companies.map((comp) => (
            <Link key={comp.id} to={`/companies/${comp.id}`} className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={24} style={{ color: '#4f46e5' }} />
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>{comp.name}</h4>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{comp.industry || 'Tech & IT'}</div>
                <div style={{ fontSize: '0.75rem', color: '#0ea5e9', fontWeight: 600, marginTop: '2px' }}>{comp.active_jobs_count} Open Jobs</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
