import type React from 'react';

/**
 * UI-only gating helper.
 * Do not rely on this for security; backend permissions remain authoritative.
 */
export function RoleGate(props: { allow: boolean; children: React.ReactNode }) {
  if (!props.allow) return null;
  return <>{props.children}</>;
}

