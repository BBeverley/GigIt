import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { apiFetch } from '../api/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTableToolbar } from '@/components/ui-patterns/DataTableToolbar';
import { EmptyState } from '@/components/ui-patterns/EmptyState';
import { PageHeader } from '@/components/ui-patterns/PageHeader';
import { TableSkeleton } from '@/components/ui-patterns/LoadingSkeletons';
import { Plus, SearchX } from 'lucide-react';

type Job = {
  jobId: string;
  reference: string;
  name: string;
  status: string;
};

export function MyJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams();
        if (q.trim()) qs.set('q', q.trim());
        const res = await apiFetch(`/api/v1/jobs?${qs.toString()}`);
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
  }, [q]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Jobs"
        subtitle="Jobs assigned to you. Track status, access files, and manage notes."
        actions={
          <Button asChild>
            <Link to="/jobs/create">
              <Plus className="mr-2 h-4 w-4" />
              New Job
            </Link>
          </Button>
        }
      />

      <Card className="rounded-2xl shadow-sm">
        <div className="space-y-4 p-6">
          <DataTableToolbar
            searchValue={q}
            onSearchChange={setQ}
            searchPlaceholder="Search by name or reference"
          />

          {error ? (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {loading ? <TableSkeleton /> : null}

          {!loading && !error && jobs.length === 0 ? (
            <EmptyState
              icon={<SearchX className="h-6 w-6" />}
              title="No jobs found"
              description={q.trim() ? 'No jobs matched your search.' : 'You have no jobs assigned yet.'}
              action={
                q.trim()
                  ? {
                      label: 'Clear search',
                      onClick: () => setQ(''),
                    }
                  : undefined
              }
            />
          ) : null}

          {!loading && !error && jobs.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Ref</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-[140px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((j) => (
                    <TableRow key={j.jobId} className="hover:bg-muted/40">
                      <TableCell className="font-medium">
                        <Link className="underline-offset-4 hover:underline" to={`/jobs/${j.jobId}`}>
                          {j.reference}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">{j.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{j.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}


