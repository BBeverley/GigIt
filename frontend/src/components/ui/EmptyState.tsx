import type React from 'react';

export function EmptyState(props: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div style={{ padding: 16, border: '1px dashed #bbb', borderRadius: 8 }}>
      <h4 style={{ marginTop: 0 }}>{props.title}</h4>
      {props.description ? <p style={{ color: '#555' }}>{props.description}</p> : null}
      {props.action ? <div style={{ marginTop: 8 }}>{props.action}</div> : null}
    </div>
  );
}

