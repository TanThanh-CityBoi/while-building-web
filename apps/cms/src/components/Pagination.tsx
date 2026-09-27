import type { Pagination as PaginationMeta } from '@while-building/types';
import { Button } from '@while-building/ui';
import styles from './Pagination.module.css';

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
    <nav className={styles.pagination} aria-label="Pagination">
      <p className={styles.summary}>
        {total === 0 ? 'No results' : `Showing ${first}–${last} of ${total}`}
      </p>
      <div className={styles.buttons}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page <= 1}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
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
