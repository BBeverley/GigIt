import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { apiFetch } from '../../api/client';
import { FileUploadDialog } from '../../components/files/FileUploadDialog';

import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTableToolbar } from '@/components/ui-patterns/DataTableToolbar';
import { EmptyState } from '@/components/ui-patterns/EmptyState';
import { SectionCard } from '@/components/ui-patterns/SectionCard';
import { TableSkeleton } from '@/components/ui-patterns/LoadingSkeletons';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

type FileItem = {
  fileId: string;
  area: 'Shared' | 'Internal';
  category: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
};

export function FilesTab() {
  const { jobId } = useParams();
  const [area, setArea] = useState<'Shared' | 'Internal'>('Shared');
  const [category, setCategory] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    p.set('area', area);
    if (category) p.set('category', category);
    return `?${p.toString()}`;
  }, [area, category]);

  async function refresh() {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/v1/jobs/${jobId}/files${query}`);
      const json = await res.json();
      setFiles(json.files ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, query]);

  if (!jobId) return <p>Missing jobId</p>;

  return (
    <div className="space-y-6">
      <SectionCard title="Files" description="Shared and internal documents for this job">
        {error ? (
          <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <DataTableToolbar
            searchValue={category}
            onSearchChange={setCategory}
            searchPlaceholder="Filter by category"
            filters={
              <Select value={area} onValueChange={(v) => setArea(v as 'Shared' | 'Internal')}>
                <SelectTrigger className="h-9 w-[160px]">
                  <SelectValue placeholder="Area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Shared">Shared</SelectItem>
                  <SelectItem value="Internal">Internal</SelectItem>
                </SelectContent>
              </Select>
            }
          />

          <FileUploadDialog jobId={jobId} area={area} onUploaded={() => void refresh()} />
        </div>

        {loading ? <TableSkeleton rows={5} /> : null}

        {!loading && !error && files.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title="No files"
            description="Upload a file to share with the crew, or store internal docs."
          />
        ) : null}

        {!loading && !error && files.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead className="w-[160px]">Category</TableHead>
                  <TableHead className="hidden w-[160px] md:table-cell">Area</TableHead>
                  <TableHead className="hidden w-[200px] md:table-cell">Uploaded</TableHead>
                  <TableHead className="w-[120px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((f) => (
                  <TableRow key={f.fileId} className="hover:bg-muted/40">
                    <TableCell className="font-medium">{f.originalFileName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{f.category}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">{f.area}</Badge>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">{f.uploadedAt}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={async () => {
                          const res = await apiFetch(`/api/v1/jobs/${jobId}/files/${f.fileId}/download-url`);
                          const json = await res.json();
                          window.open(json.download.url, '_blank');
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}

        <p className="mt-3 text-xs text-muted-foreground">
          Delete + role-based UI gating are implemented in Phase 6.
        </p>
      </SectionCard>
    </div>
  );
}

