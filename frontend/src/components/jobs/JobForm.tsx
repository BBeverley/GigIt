import { useMemo, useState } from 'react';

export type JobFormValues = {
  reference: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  notes: string;
  status: 'Draft' | 'Active' | 'Archived';
};

export function JobForm(props: {
  initial?: Partial<JobFormValues>;
  disableReference?: boolean;
  submitLabel: string;
  onSubmit: (values: JobFormValues) => Promise<void> | void;
}) {
  const initial = useMemo<JobFormValues>(
    () => ({
      reference: props.initial?.reference ?? '',
      name: props.initial?.name ?? '',
      startDate: props.initial?.startDate ?? '',
      endDate: props.initial?.endDate ?? '',
      location: props.initial?.location ?? '',
      notes: props.initial?.notes ?? '',
      status: props.initial?.status ?? 'Draft',
    }),
    [props.initial],
  );

  const [values, setValues] = useState<JobFormValues>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await props.onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  function update<K extends keyof JobFormValues>(key: K, value: JobFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 10, maxWidth: 520 }}>
      {error ? <pre style={{ color: 'crimson' }}>{error}</pre> : null}

      <label>
        Reference
        <input
          value={values.reference}
          onChange={(e) => update('reference', e.target.value)}
          disabled={props.disableReference}
          required
        />
      </label>

      <label>
        Name
        <input value={values.name} onChange={(e) => update('name', e.target.value)} required />
      </label>

      <label>
        Start Date
        <input
          type="date"
          value={values.startDate}
          onChange={(e) => update('startDate', e.target.value)}
          required
        />
      </label>

      <label>
        End Date
        <input
          type="date"
          value={values.endDate}
          onChange={(e) => update('endDate', e.target.value)}
          required
        />
      </label>

      <label>
        Location
        <input value={values.location} onChange={(e) => update('location', e.target.value)} required />
      </label>

      <label>
        Notes
        <textarea value={values.notes} onChange={(e) => update('notes', e.target.value)} rows={4} />
      </label>

      <label>
        Status
        <select
          value={values.status}
          onChange={(e) => update('status', e.target.value as JobFormValues['status'])}
        >
          <option value="Draft">Draft</option>
          <option value="Active">Active</option>
          <option value="Archived">Archived</option>
        </select>
      </label>

      <button type="submit" disabled={saving}>
        {saving ? 'Saving…' : props.submitLabel}
      </button>
    </form>
  );
}

