import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { apiFetch } from '../../api/client';

import { Badge } from '@/components/ui/badge';
import { SectionCard } from '@/components/ui-patterns/SectionCard';
import { TableSkeleton } from '@/components/ui-patterns/LoadingSkeletons';

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
  if (error)
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  if (!job) return <TableSkeleton rows={4} />;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <SectionCard
        title="Summary"
        description="High-level details and current status"
        className="lg:col-span-2"
      >
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Status</dt>
            <dd className="mt-1">
              <Badge variant="secondary">{job.status}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Location</dt>
            <dd className="mt-1 text-sm">{job.location}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Start</dt>
            <dd className="mt-1 text-sm">{job.startDate}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">End</dt>
            <dd className="mt-1 text-sm">{job.endDate}</dd>
          </div>
        </dl>
      </SectionCard>

      <SectionCard title="Notes" description="Job-level notes (read-only here)">
        {job.notes ? <p className="text-sm whitespace-pre-wrap">{job.notes}</p> : <p className="text-sm text-muted-foreground">No notes.</p>}
      </SectionCard>
    </div>
  );
}

