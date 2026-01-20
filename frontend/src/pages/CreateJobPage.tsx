import { useNavigate } from 'react-router-dom';

import { apiFetch } from '../api/client';
import { JobForm } from '../components/jobs/JobForm';
import { PageHeader } from '@/components/ui-patterns/PageHeader';

export function CreateJobPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader title="Create Job" subtitle="Set up a new job with dates, location, and status." />
      <JobForm
        submitLabel="Create"
        onSubmit={async (values) => {
          const res = await apiFetch('/api/v1/jobs', {
            method: 'POST',
            body: JSON.stringify({
              reference: values.reference,
              name: values.name,
              startDate: values.startDate,
              endDate: values.endDate,
              location: values.location,
              notes: values.notes || undefined,
              status: values.status,
            }),
          });

          const json = await res.json();
          navigate(`/jobs/${json.job.jobId}`);
        }}
      />
    </div>
  );
}

