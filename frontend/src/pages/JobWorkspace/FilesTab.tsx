import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { apiFetch } from '../../api/client';
import { FileUploadDialog } from '../../components/files/FileUploadDialog';

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

  const query = useMemo(() => {
    const p = new URLSearchParams();
    p.set('area', area);
    if (category) p.set('category', category);
    return `?${p.toString()}`;
  }, [area, category]);

  async function refresh() {
    if (!jobId) return;
    setError(null);
    try {
      const res = await apiFetch(`/api/v1/jobs/${jobId}/files${query}`);
      const json = await res.json();
      setFiles(json.files ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, query]);

  if (!jobId) return <p>Missing jobId</p>;

  return (
    <div>
      <h3>Files</h3>
      {error ? <pre style={{ color: 'crimson' }}>{error}</pre> : null}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <select value={area} onChange={(e) => setArea(e.target.value as 'Shared' | 'Internal')}>
          <option value="Shared">Shared</option>
          <option value="Internal">Internal</option>
        </select>
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category filter"
        />
        <FileUploadDialog jobId={jobId} area={area} onUploaded={() => void refresh()} />
      </div>

      <ul style={{ paddingLeft: 16 }}>
        {files.map((f) => (
          <li key={f.fileId}>
            <button
              onClick={async () => {
                const res = await apiFetch(`/api/v1/jobs/${jobId}/files/${f.fileId}/download-url`);
                const json = await res.json();
                window.open(json.download.url, '_blank');
              }}
            >
              Download
            </button>{' '}
            {f.originalFileName} ({f.area}/{f.category})
          </li>
        ))}
      </ul>

      <p style={{ color: '#666' }}>
        Delete + role-based UI gating are implemented in Phase 6.
      </p>
    </div>
  );
}

