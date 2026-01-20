import { useState } from 'react';

import { apiFetch } from '../../api/client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

export function FileUploadDialog(props: {
  jobId: string;
  area: 'Shared' | 'Internal';
  onUploaded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('General');
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const initRes = await apiFetch(`/api/v1/jobs/${props.jobId}/files/initiate-upload`, {
        method: 'POST',
        body: JSON.stringify({
          area: props.area,
          category,
          originalFileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          sizeBytes: file.size,
        }),
      });
      const initJson = await initRes.json();

      const put = await fetch(initJson.upload.url, {
        method: 'PUT',
        headers: initJson.upload.headers,
        body: file,
      });
      if (!put.ok) throw new Error(`Upload failed: ${put.status}`);

      props.onUploaded();
      setOpen(false);
      toast.success('File uploaded');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="h-9">
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload file</DialogTitle>
          <DialogDescription>
            Upload a {props.area.toLowerCase()} file for this job. The file will appear in the list once completed.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} disabled={uploading} />
            <p className="text-xs text-muted-foreground">Used for filtering and organization.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={uploading}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

