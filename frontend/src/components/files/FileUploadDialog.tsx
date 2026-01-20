import { useState } from 'react';

import { apiFetch } from '../../api/client';

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
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} disabled={uploading}>
        Upload
      </button>
    );
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: 8 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <strong>Upload</strong>
        <button onClick={() => setOpen(false)} disabled={uploading}>
          Close
        </button>
      </div>

      {error ? <pre style={{ color: 'crimson' }}>{error}</pre> : null}

      <label>
        Category
        <input value={category} onChange={(e) => setCategory(e.target.value)} disabled={uploading} />
      </label>

      <input
        type="file"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
        }}
      />
    </div>
  );
}

