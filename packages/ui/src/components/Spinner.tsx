import { cx } from '@while-building/utils';
import styles from './Spinner.module.css';

interface SpinnerProps {
  size?: 'sm' | 'md';
  className?: string;
}

/** Decorative spinner; pair it with visible or visually-hidden text. */
export function Spinner({ size = 'md', className }: SpinnerProps) {
  return <span className={cx(styles.spinner, styles[size], className)} aria-hidden="true" />;
}
