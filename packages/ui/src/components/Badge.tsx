import type { ReactNode } from 'react';
import { cx } from '@while-building/utils';
import styles from './Badge.module.css';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

export interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  /** `soft`: tinted pill. `dot`: colored dot + mono label, for quiet status lines. */
  variant?: 'soft' | 'dot';
  className?: string;
}

export function Badge({ children, tone = 'neutral', variant = 'soft', className }: BadgeProps) {
  return (
    <span className={cx(styles.badge, styles[variant], styles[tone], className)}>
      {variant === 'dot' && <span className={styles.indicator} aria-hidden="true" />}
      {children}
    </span>
  );
}
