import type { PlugUpSheetDto } from '../../domain/paperwork/plugUpService';

export function renderPlugUpLines(input: {
  job: { reference: string; name: string; startDate?: string; endDate?: string };
  sheet: PlugUpSheetDto;
}) {
  const { job, sheet } = input;
  const lines: string[] = [];
  lines.push('Plug-Up Sheet');
  lines.push(`Job: ${job.reference} - ${job.name}`);
  if (job.startDate && job.endDate) {
    lines.push(`Dates: ${job.startDate} -> ${job.endDate}`);
  }
  lines.push('');

  const rows = [...sheet.rows].sort((a, b) => a.orderIndex - b.orderIndex);
  for (const r of rows) {
    lines.push(`${r.orderIndex}. ${r.label}: ${r.value}`);
  }

  return lines;
}

