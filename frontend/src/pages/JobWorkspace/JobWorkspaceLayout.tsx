import { useEffect, useState } from 'react';
import { NavLink, Outlet, useParams } from 'react-router-dom';

import { apiFetch } from '../../api/client';
import { ActivityLog } from '../../components/audit/ActivityLog';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/ui-patterns/PageHeader';
import { SectionCard } from '@/components/ui-patterns/SectionCard';
import { PencilLine } from 'lucide-react';

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
    <div className="space-y-6">
      <PageHeader
        title="Job Workspace"
        subtitle={job ? `${job.reference} • ${job.name}` : 'Loading job context…'}
        actions={
          <Button asChild variant="secondary">
            <NavLink to={`/jobs/${jobId}/edit`}>
              <PencilLine className="mr-2 h-4 w-4" />
              Edit
            </NavLink>
          </Button>
        }
      />

      <SectionCard
        className="p-0"
        contentClassName="p-0"
        title={undefined}
        description={undefined}
      >
        <div className="border-b px-2 py-2">
          <Tabs value={tabValueFromPath(window.location.pathname, jobId)}>
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="overview" asChild>
                <NavLink to={`/jobs/${jobId}`} end>
                  Overview
                </NavLink>
              </TabsTrigger>
              <TabsTrigger value="crew" asChild>
                <NavLink to={`/jobs/${jobId}/crew`}>Crew</NavLink>
              </TabsTrigger>
              <TabsTrigger value="files" asChild>
                <NavLink to={`/jobs/${jobId}/files`}>Files</NavLink>
              </TabsTrigger>
              <TabsTrigger value="notes" asChild>
                <NavLink to={`/jobs/${jobId}/notes`}>Notes</NavLink>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {error ? (
          <div className="p-6">
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          </div>
        ) : null}

        <div className="p-6">
          <Outlet />
        </div>
      </SectionCard>

      <SectionCard title="Activity" description="Recent changes and actions" className="rounded-2xl">
        <ActivityLog jobId={jobId} />
      </SectionCard>
    </div>
  );
}

function tabValueFromPath(pathname: string, jobId: string) {
  const base = `/jobs/${jobId}`;
  if (pathname === base) return 'overview';
  if (pathname.startsWith(`${base}/crew`)) return 'crew';
  if (pathname.startsWith(`${base}/files`)) return 'files';
  if (pathname.startsWith(`${base}/notes`)) return 'notes';
  return 'overview';
}

