import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { apiFetch } from '../../api/client';

type Assignment = {
  assignmentId: string;
  userId: string;
  role: string;
  assignmentNotes?: string;
};

export function CrewTab() {
  const { jobId } = useParams();
  const [items, setItems] = useState<Assignment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    async function run() {
      setError(null);
      try {
        const res = await apiFetch(`/api/v1/jobs/${jobId}/assignments`);
        const json = await res.json();
        if (!cancelled) setItems(json.assignments ?? []);
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

  return (
    <div>
      <h3>Crew</h3>
      <ul style={{ paddingLeft: 16 }}>
        {items.map((a) => (
          <li key={a.assignmentId}>
            <strong>{a.userId}</strong> — {a.role}
          </li>
        ))}
      </ul>
      <p style={{ color: '#666' }}>
        Assignment management UI is added later; API endpoints are available.
      </p>
    </div>
  );
}

