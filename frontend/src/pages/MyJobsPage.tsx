import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { apiFetch } from '../api/client';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';

type Job = {
  jobId: string;
  reference: string;
  name: string;
  status: string;
};

export function MyJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams();
        if (q.trim()) qs.set('q', q.trim());
        const res = await apiFetch(`/api/v1/jobs?${qs.toString()}`);
        const json = await res.json();
        if (!cancelled) setJobs(json.jobs ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [q]);

  return (
    <div>
      <h2>My Jobs</h2>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input
          placeholder="Search by name or reference"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {loading ? <LoadingState /> : null}
      {error ? <pre style={{ color: 'crimson' }}>{error}</pre> : null}

      {!loading && !error && jobs.length === 0 ? (
        <EmptyState title="No jobs" description="No jobs matched your search." />
      ) : null}
      <ul style={{ paddingLeft: 16 }}>
        {jobs.map((j) => (
          <li key={j.jobId}>
            <Link to={`/jobs/${j.jobId}`}>{j.reference}</Link> — {j.name} ({j.status})
          </li>
        ))}
      </ul>
    </div>
  );
}


