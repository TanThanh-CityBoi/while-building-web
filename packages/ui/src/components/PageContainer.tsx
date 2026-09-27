import type { ComponentPropsWithoutRef } from 'react';
import { cx } from '@while-building/utils';
import styles from './PageContainer.module.css';

/** Centers content at `--content-width` with responsive `--gutter` padding. */
export function PageContainer({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div className={cx(styles.container, className)} {...props} />;
}
