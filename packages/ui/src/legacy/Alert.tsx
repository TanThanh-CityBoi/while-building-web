import type { ReactNode } from 'react';
import { cx } from '@while-building/utils';
import styles from './Alert.module.css';

export interface AlertProps {
  tone?: 'info' | 'success' | 'warning' | 'danger';
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** Inline message, e.g. a form submission error. Errors are announced immediately. */
export function Alert({ tone = 'info', title, children, className }: AlertProps) {
  return (
    <div
      className={cx(styles.alert, styles[tone], className)}
      role={tone === 'danger' ? 'alert' : 'status'}
    >
      {title && <p className={styles.title}>{title}</p>}
      {children && <div className={styles.body}>{children}</div>}
    </div>
  );
}
