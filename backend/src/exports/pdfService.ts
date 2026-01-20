// Minimal deterministic PDF generator (no external deps).
// Produces a single-page PDF with monospaced-ish layout using Helvetica.

function escapePdfString(input: string) {
  return input.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

export function renderSinglePagePdfFromLines(lines: string[]) {
  // PDF user space is points; US Letter is 612x792.
  // Start near top-left with a fixed line height for determinism.
  const fontSize = 12;
  const left = 50;
  const top = 760;
  const lineHeight = 14;

  const contentParts: string[] = [];
  contentParts.push('BT');
  contentParts.push(`/F1 ${fontSize} Tf`);
  contentParts.push(`${left} ${top} Td`);

  for (let i = 0; i < lines.length; i++) {
    const text = escapePdfString(lines[i] ?? '');
    contentParts.push(`(${text}) Tj`);
    if (i !== lines.length - 1) contentParts.push(`0 -${lineHeight} Td`);
  }
  contentParts.push('ET');

  const contentStream = contentParts.join('\n') + '\n';

  const objects: string[] = [];

  // 1: catalog
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // 2: pages
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  // 3: page
  objects.push(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
  );

  // 4: font
  objects.push('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');

  // 5: content stream
  const contentBytes = Buffer.from(contentStream, 'utf8');
  objects.push(
    `5 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n${contentStream}endstream\nendobj\n`,
  );

  const header = '%PDF-1.4\n%\u00E2\u00E3\u00CF\u00D3\n';

  const chunks: string[] = [header];
  const offsets: number[] = [0]; // object 0 (free)
  let byteCount = Buffer.byteLength(header, 'utf8');

  for (const obj of objects) {
    offsets.push(byteCount);
    chunks.push(obj);
    byteCount += Buffer.byteLength(obj, 'utf8');
  }

  const xrefStart = byteCount;
  const xrefLines: string[] = [];
  xrefLines.push('xref');
  xrefLines.push(`0 ${objects.length + 1}`);
  xrefLines.push('0000000000 65535 f ');
  for (let i = 1; i < offsets.length; i++) {
    const off = offsets[i] ?? 0;
    xrefLines.push(`${String(off).padStart(10, '0')} 00000 n `);
  }
  const xref = xrefLines.join('\n') + '\n';

  const trailer =
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  const pdf = chunks.join('') + xref + trailer;
  return Buffer.from(pdf, 'utf8');
}

