import type { ReactNode } from 'react';
import { cx } from '@while-building/utils';
import { Button } from './Button';
import { Spinner } from './Spinner';
import styles from './States.module.css';

export interface EmptyStateProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Shown when there is nothing to display yet (or a filter matches nothing). */
export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cx(styles.state, className)}>
      {icon && (
        <div className={styles.icon} aria-hidden="true">
          {icon}
        </div>
      )}
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

export interface LoadingStateProps {
  label?: string;
  /** Fill the viewport, e.g. while restoring a session on startup. */
  fullscreen?: boolean;
  className?: string;
}

/**
 * Appears after a short delay (`--loading-delay`, 300ms) so fast loads don't flash a spinner.
 * The label is announced to screen readers immediately.
 */
export function LoadingState({
  label = 'Loading…',
  fullscreen = false,
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cx(styles.state, styles.loading, fullscreen && styles.fullscreen, className)}
      role="status"
    >
      <Spinner />
      <p className={styles.description}>{label}</p>
    </div>
  );
}

export interface ErrorStateProps {
  title?: ReactNode;
  description?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  /** Extra action(s), e.g. a link back home. */
  action?: ReactNode;
  fullscreen?: boolean;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
  retryLabel = 'Try again',
  action,
  fullscreen = false,
  className,
}: ErrorStateProps) {
  return (
    <div className={cx(styles.state, fullscreen && styles.fullscreen, className)} role="alert">
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {(onRetry || action) && (
        <div className={styles.action}>
          {onRetry && (
            <Button variant="secondary" size="sm" onClick={onRetry}>
              {retryLabel}
            </Button>
          )}
          {action}
        </div>
      )}
    </div>
  );
}
