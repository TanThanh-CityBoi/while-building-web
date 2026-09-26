import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './StatusIndicator.module.css';

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral';

interface StatusIndicatorProps {
  tone: StatusTone;
  children: ReactNode;
}

/** A colored dot followed by a short status label. */
export function StatusIndicator({ tone, children }: StatusIndicatorProps) {
  return (
    <span className={styles.status}>
      <span className={cx(styles.dot, styles[tone])} aria-hidden="true" />
      {children}
    </span>
  );
}
