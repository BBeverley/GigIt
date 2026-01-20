import type React from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function EmptyState(props: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: { label: string; onClick: () => void };
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-card p-10 text-center',
        props.className,
      )}
    >
      {props.icon ? <div className="text-muted-foreground">{props.icon}</div> : null}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">{props.title}</h3>
        {props.description ? <p className="text-xs text-muted-foreground">{props.description}</p> : null}
      </div>
      {props.action ? (
        <Button variant="secondary" onClick={props.action.onClick}>
          {props.action.label}
        </Button>
      ) : null}
    </div>
  );
}

