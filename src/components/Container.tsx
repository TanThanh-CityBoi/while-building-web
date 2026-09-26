import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './Container.module.css';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/** Centers content at the site's max width with responsive side gutters. */
export function Container({ children, className }: ContainerProps) {
  return <div className={cx(styles.container, className)}>{children}</div>;
}
