import { useEffect, useState } from 'react';

import { apiFetch } from '../../api/client';
import { LoadingState } from '../ui/LoadingState';

type ActivityEvent = {
  eventId: string;
  jobId: string;
  actorUserId: string;
  eventType: string;
  summary: string;
  createdAt: string;
};

export function ActivityLog(props: { jobId?: string }) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      setForbidden(false);
      try {
        const qs = new URLSearchParams();
        if (props.jobId) qs.set('jobId', props.jobId);
        qs.set('limit', '50');
        const res = await apiFetch(`/api/v1/audit-events?${qs.toString()}`);
        const json = await res.json();
        if (!cancelled) setEvents(json.events ?? []);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        // Server-side role gating returns 403; hide entry point without a hard error.
        if (!cancelled && msg.includes('Forbidden')) {
          setForbidden(true);
          setEvents([]);
          return;
        }
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [props.jobId]);

  if (forbidden) return null;
  if (loading) return <LoadingState label="Loading activity…" />;
  if (error) return <pre style={{ color: 'crimson' }}>{error}</pre>;

  return (
    <div>
      <h3>Activity</h3>
      <ul style={{ paddingLeft: 16 }}>
        {events.map((e) => (
          <li key={e.eventId}>
            <code>{e.createdAt}</code> — {e.summary}
          </li>
        ))}
      </ul>
    </div>
  );
}

