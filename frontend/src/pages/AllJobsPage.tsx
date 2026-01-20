import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { apiFetch } from '../api/client';

type Job = {
  jobId: string;
  reference: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
};

export function AllJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [status, setStatus] = useState<string>('');
  const [q, setQ] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (status) params.set('status', status);
    const s = params.toString();
    return s ? `?${s}` : '';
  }, [q, status]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`/api/v1/jobs${query}`);
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
  }, [query]);

  return (
    <div>
      <h2>All Jobs</h2>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or reference"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">(Hide Archived)</option>
          <option value="Draft">Draft</option>
          <option value="Active">Active</option>
          <option value="Archived">Archived</option>
        </select>
      </div>

      {loading ? <p>Loading…</p> : null}
      {error ? <pre style={{ color: 'crimson' }}>{error}</pre> : null}

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

