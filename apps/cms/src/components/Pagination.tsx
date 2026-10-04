import type { Pagination as PaginationMeta } from '@while-building/types';
import { Button } from '@while-building/ui/components/button';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({ meta, onPageChange, disabled = false }: PaginationProps) {
  const { page, pageSize, total, totalPages } = meta;
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3"
    >
      <p className="text-xs text-muted-foreground tabular-nums">
        {total === 0 ? 'No results' : `Showing ${first}–${last} of ${total}`}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page <= 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || page >= totalPages}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
