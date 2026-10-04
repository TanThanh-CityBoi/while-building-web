import type { ReactNode } from 'react';

/** Filter/search row at the top of a table card. The first control grows. */
export function Toolbar({ children, summary }: { children: ReactNode; summary?: ReactNode }) {
  return (
    <div
      role="search"
      className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3"
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 [&>*:first-child]:max-w-sm [&>*:first-child]:min-w-48 [&>*:first-child]:flex-1">
        {children}
      </div>
      {summary && <p className="text-xs text-muted-foreground tabular-nums">{summary}</p>}
    </div>
  );
}
