import type React from 'react';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export function DataTableToolbar(props: {
  searchValue: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between', props.className)}>
      <Input
        value={props.searchValue}
        onChange={(e) => props.onSearchChange(e.target.value)}
        placeholder={props.searchPlaceholder ?? 'Search…'}
        className="h-9 sm:max-w-sm"
      />
      <div className="flex items-center gap-2">
        {props.filters}
        {props.actions}
      </div>
    </div>
  );
}

