import type React from 'react';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SectionCard(props: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Card className={cn('rounded-2xl shadow-sm', props.className)}>
      {props.title || props.description || props.actions ? (
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="min-w-0">
            {props.title ? <CardTitle className="text-lg font-semibold">{props.title}</CardTitle> : null}
            {props.description ? (
              <p className="mt-1 text-sm text-muted-foreground">{props.description}</p>
            ) : null}
          </div>
          {props.actions ? <div className="shrink-0">{props.actions}</div> : null}
        </CardHeader>
      ) : null}
      <CardContent className={cn('p-6 pt-0', props.contentClassName)}>{props.children}</CardContent>
    </Card>
  );
}

