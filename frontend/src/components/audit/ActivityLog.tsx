import { useEffect, useState } from 'react';

import { apiFetch } from '../../api/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableSkeleton } from '@/components/ui-patterns/LoadingSkeletons';

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
  if (loading) return <TableSkeleton rows={6} />;
  if (error)
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    );

  return (
    <div className="overflow-x-auto rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">When</TableHead>
            <TableHead>Summary</TableHead>
            <TableHead className="hidden w-[200px] md:table-cell">Actor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((e) => (
            <TableRow key={e.eventId} className="hover:bg-muted/40">
              <TableCell className="font-mono text-xs text-muted-foreground">{e.createdAt}</TableCell>
              <TableCell className="text-sm">{e.summary}</TableCell>
              <TableCell className="hidden text-sm text-muted-foreground md:table-cell">{e.actorUserId}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

