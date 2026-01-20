import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { apiFetch } from '../../api/client';

type Job = {
  reference: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
  notes?: string;
};

export function OverviewTab() {
  const { jobId } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    async function run() {
      setError(null);
      try {
        const res = await apiFetch(`/api/v1/jobs/${jobId}`);
        const json = await res.json();
        if (!cancelled) setJob(json.job);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  if (!jobId) return <p>Missing jobId</p>;
  if (error) return <pre style={{ color: 'crimson' }}>{error}</pre>;
  if (!job) return <p>Loading…</p>;

  return (
    <div>
      <h3>Overview</h3>
      <dl>
        <dt>Status</dt>
        <dd>{job.status}</dd>
        <dt>Dates</dt>
        <dd>
          {job.startDate} → {job.endDate}
        </dd>
        <dt>Location</dt>
        <dd>{job.location}</dd>
      </dl>
    </div>
  );
}

