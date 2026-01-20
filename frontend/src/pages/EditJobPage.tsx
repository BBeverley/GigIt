import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { apiFetch } from '../api/client';
import { JobForm, type JobFormValues } from '../components/jobs/JobForm';
import { PageHeader } from '@/components/ui-patterns/PageHeader';
import { TableSkeleton } from '@/components/ui-patterns/LoadingSkeletons';

type Job = JobFormValues & { jobId: string };

export function EditJobPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
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
        if (cancelled) return;
        setJob({
          jobId: json.job.jobId,
          reference: json.job.reference,
          name: json.job.name,
          startDate: json.job.startDate,
          endDate: json.job.endDate,
          location: json.job.location,
          notes: json.job.notes ?? '',
          status: json.job.status,
        });
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
  if (!job) return <TableSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Job" subtitle={`Update details for ${job.reference}.`} />
      <JobForm
        initial={job}
        disableReference
        submitLabel="Save"
        onSubmit={async (values) => {
          await apiFetch(`/api/v1/jobs/${jobId}`, {
            method: 'PATCH',
            body: JSON.stringify({
              name: values.name,
              startDate: values.startDate,
              endDate: values.endDate,
              location: values.location,
              notes: values.notes,
              status: values.status,
            }),
          });

          navigate(`/jobs/${jobId}`);
        }}
      />
    </div>
  );
}

