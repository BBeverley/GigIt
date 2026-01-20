import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { apiFetch } from '../../api/client';

export function NotesTab() {
  const { jobId } = useParams();
  const [text, setText] = useState('');
  const [meta, setMeta] = useState<{ lastEditedByUserId?: string; lastEditedAt?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    async function run() {
      setError(null);
      try {
        const res = await apiFetch(`/api/v1/jobs/${jobId}/notes`);
        const json = await res.json();
        if (cancelled) return;
        setText(json.notes?.text ?? '');
        setMeta({
          lastEditedByUserId: json.notes?.lastEditedByUserId,
          lastEditedAt: json.notes?.lastEditedAt,
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

  async function save() {
    if (!jobId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/v1/jobs/${jobId}/notes`, {
        method: 'PATCH',
        body: JSON.stringify({ text }),
      });
      const json = await res.json();
      setMeta({
        lastEditedByUserId: json.notes?.lastEditedByUserId,
        lastEditedAt: json.notes?.lastEditedAt,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  if (!jobId) return <p>Missing jobId</p>;

  return (
    <div>
      <h3>Notes</h3>
      {error ? <pre style={{ color: 'crimson' }}>{error}</pre> : null}

      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} style={{ width: '100%' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <button onClick={() => void save()} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        <div style={{ color: '#666' }}>
          {meta.lastEditedByUserId ? `Last edited by ${meta.lastEditedByUserId}` : 'Not edited yet'}
          {meta.lastEditedAt ? ` at ${meta.lastEditedAt}` : ''}
        </div>
      </div>
    </div>
  );
}

