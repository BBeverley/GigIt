import type React from 'react';

import { cn } from '@/lib/utils';

export function PageHeader(props: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-3', props.className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{props.title}</h1>
          {props.subtitle ? <p className="mt-1 text-sm text-muted-foreground">{props.subtitle}</p> : null}
        </div>
        {props.actions ? <div className="flex shrink-0 items-center gap-2">{props.actions}</div> : null}
      </div>
      {props.children ? <div>{props.children}</div> : null}
    </div>
  );
}

