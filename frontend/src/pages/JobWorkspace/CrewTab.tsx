import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { apiFetch } from '../../api/client';

import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SectionCard } from '@/components/ui-patterns/SectionCard';
import { EmptyState } from '@/components/ui-patterns/EmptyState';
import { TableSkeleton } from '@/components/ui-patterns/LoadingSkeletons';
import { Users } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`/api/v1/jobs/${jobId}/assignments`);
        const json = await res.json();
        if (!cancelled) setItems(json.assignments ?? []);
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
  }, [jobId]);

  if (!jobId) return <p>Missing jobId</p>;

  return (
    <div className="space-y-6">
      <SectionCard title="Crew" description="Assignments and roles for this job">
        {error ? (
          <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {loading ? <TableSkeleton rows={5} /> : null}

        {!loading && !error && items.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="No crew assigned"
            description="Assignment management UI is added later; API endpoints are available."
          />
        ) : null}

        {!loading && !error && items.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="w-[180px]">Role</TableHead>
                  <TableHead className="hidden md:table-cell">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((a) => (
                  <TableRow key={a.assignmentId} className="hover:bg-muted/40">
                    <TableCell className="font-medium">{a.userId}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{a.role}</Badge>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {a.assignmentNotes ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </SectionCard>
    </div>
  );
}

