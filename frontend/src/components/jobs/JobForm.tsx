import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

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
      toast.success(`${props.submitLabel}d`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  function update<K extends keyof JobFormValues>(key: K, value: JobFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <form onSubmit={submit} className="space-y-6 p-6">
        {error ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="reference">Reference</Label>
            <Input
              id="reference"
              value={values.reference}
              onChange={(e) => update('reference', e.target.value)}
              disabled={props.disableReference}
              required
            />
            <p className="text-xs text-muted-foreground">A short code used in labels and exports.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={values.name} onChange={(e) => update('name', e.target.value)} required />
            <p className="text-xs text-muted-foreground">Venue / production name.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={values.startDate}
              onChange={(e) => update('startDate', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={values.endDate}
              onChange={(e) => update('endDate', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={values.location} onChange={(e) => update('location', e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={values.status} onValueChange={(v) => update('status', v as JobFormValues['status'])}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Archived jobs are hidden by default in lists.</p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={values.notes} onChange={(e) => update('notes', e.target.value)} rows={6} />
            <p className="text-xs text-muted-foreground">Optional internal notes.</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : props.submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}

