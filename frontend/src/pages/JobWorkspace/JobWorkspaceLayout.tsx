import { useEffect, useState } from 'react';
import { NavLink, Outlet, useParams } from 'react-router-dom';

import { apiFetch } from '../../api/client';
import { ActivityLog } from '../../components/audit/ActivityLog';

type Job = {
  jobId: string;
  reference: string;
  name: string;
};

export function JobWorkspaceLayout() {
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
        if (!cancelled) {
          setJob({ jobId: json.job.jobId, reference: json.job.reference, name: json.job.name });
        }
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>Job Workspace</h2>
          {job ? (
            <div style={{ color: '#555' }}>
              <strong>{job.reference}</strong> — {job.name}
            </div>
          ) : null}
        </div>
        <div>
          <NavLink to={`/jobs/${jobId}/edit`}>Edit</NavLink>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 12, borderBottom: '1px solid #ddd' }}>
        <TabLink to={`/jobs/${jobId}`}>Overview</TabLink>
        <TabLink to={`/jobs/${jobId}/crew`}>Crew</TabLink>
        <TabLink to={`/jobs/${jobId}/files`}>Files</TabLink>
        <TabLink to={`/jobs/${jobId}/notes`}>Notes</TabLink>
      </div>

      {error ? <pre style={{ color: 'crimson' }}>{error}</pre> : null}

      <div style={{ paddingTop: 12 }}>
        <Outlet />
      </div>

      <div style={{ marginTop: 24 }}>
        <ActivityLog jobId={jobId} />
      </div>
    </div>
  );
}

function TabLink(props: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={props.to}
      end
      style={({ isActive }) => ({
        padding: '8px 0',
        textDecoration: 'none',
        borderBottom: isActive ? '2px solid #111' : '2px solid transparent',
      })}
    >
      {props.children}
    </NavLink>
  );
}

