import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { apiFetch } from '../api/client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTableToolbar } from '@/components/ui-patterns/DataTableToolbar';
import { EmptyState } from '@/components/ui-patterns/EmptyState';
import { PageHeader } from '@/components/ui-patterns/PageHeader';
import { TableSkeleton } from '@/components/ui-patterns/LoadingSkeletons';
import { Filter, MoreVertical, Plus, SearchX } from 'lucide-react';

type Job = {
  jobId: string;
  reference: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
};

export function AllJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [status, setStatus] = useState<string>('');
  const [q, setQ] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (status) params.set('status', status);
    const s = params.toString();
    return s ? `?${s}` : '';
  }, [q, status]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`/api/v1/jobs${query}`);
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
  }, [query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Jobs"
        subtitle="Browse all jobs in the system."
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
            filters={
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" className="h-9">
                    <Filter className="mr-2 h-4 w-4" />
                    {status ? `Status: ${status}` : 'Filters'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setStatus('')}>Hide archived</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatus('Draft')}>Draft</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatus('Active')}>Active</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatus('Archived')}>Archived</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            }
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
              description={q.trim() ? 'No jobs matched your search.' : 'No jobs to display for the selected filters.'}
              action={
                q.trim() || status
                  ? {
                      label: 'Clear filters',
                      onClick: () => {
                        setQ('');
                        setStatus('');
                      },
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
                    <TableHead className="hidden w-[180px] md:table-cell">Location</TableHead>
                    <TableHead className="w-[140px]">Status</TableHead>
                    <TableHead className="w-[52px]"></TableHead>
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
                      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">{j.location}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{j.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Row actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem asChild>
                              <Link to={`/jobs/${j.jobId}`}>Open</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/jobs/${j.jobId}/edit`}>Edit</Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

