import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { apiFetch } from '../../api/client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SectionCard } from '@/components/ui-patterns/SectionCard';
import { toast } from 'sonner';

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
      toast.success('Notes saved');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      toast.error('Failed to save notes');
    } finally {
      setSaving(false);
    }
  }

  if (!jobId) return <p>Missing jobId</p>;

  return (
    <SectionCard
      title="Notes"
      description={
        meta.lastEditedByUserId
          ? `Last edited by ${meta.lastEditedByUserId}${meta.lastEditedAt ? ` at ${meta.lastEditedAt}` : ''}`
          : 'Not edited yet'
      }
      actions={
        <Button onClick={() => void save()} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      }
    >
      {error ? (
        <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} />
      <p className="mt-2 text-xs text-muted-foreground">Autosave is not enabled yet. Use Save to persist changes.</p>
    </SectionCard>
  );
}

