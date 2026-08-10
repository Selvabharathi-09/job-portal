import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import api from '../../services/api';
import JobCard from '../../components/JobCard';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const res = await api.get('/user/saved-jobs');
      if (res.success) setSavedJobs(res.data.saved_jobs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (jobId) => {
    try {
      await api.delete(`/user/saved-jobs/${jobId}`);
      setSavedJobs(savedJobs.filter(s => s.job_id !== jobId));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="heading-lg">Saved Bookmarked Jobs</h1>
        <p className="text-muted">Quick access to positions you saved for later</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading saved jobs...</div>
      ) : savedJobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <Bookmark size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
          <h3>No Saved Jobs</h3>
          <p className="text-muted" style={{ margin: '0.5rem 0' }}>Bookmark jobs while searching to review or apply later.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {savedJobs.map((item) => (
            item.job && (
              <JobCard
                key={item.id}
                job={item.job}
                onSave={handleRemove}
                isSaved={true}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
