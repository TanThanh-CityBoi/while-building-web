import type { ComponentPropsWithoutRef } from 'react';
import { cx } from '@while-building/utils';
import styles from './Table.module.css';

/** Scroll container so wide tables never widen the page. */
export function TableContainer({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div className={cx(styles.container, className)} {...props} />;
}

export function Table({ className, ...props }: ComponentPropsWithoutRef<'table'>) {
  return <table className={cx(styles.table, className)} {...props} />;
}

export function TableHead(props: ComponentPropsWithoutRef<'thead'>) {
  return <thead {...props} />;
}

export function TableBody(props: ComponentPropsWithoutRef<'tbody'>) {
  return <tbody {...props} />;
}

export function TableRow({ className, ...props }: ComponentPropsWithoutRef<'tr'>) {
  return <tr className={cx(styles.row, className)} {...props} />;
}

export interface TableHeaderCellProps extends Omit<ComponentPropsWithoutRef<'th'>, 'align'> {
  align?: 'start' | 'end';
}

export function TableHeaderCell({ align = 'start', className, ...props }: TableHeaderCellProps) {
  return (
    <th
      scope="col"
      className={cx(styles.headerCell, align === 'end' && styles.alignEnd, className)}
      {...props}
    />
  );
}

export interface TableCellProps extends Omit<ComponentPropsWithoutRef<'td'>, 'align'> {
  align?: 'start' | 'end';
  /** Muted, smaller text for secondary columns (dates, counts). */
  muted?: boolean;
}

export function TableCell({ align = 'start', muted = false, className, ...props }: TableCellProps) {
  return (
    <td
      className={cx(
        styles.cell,
        align === 'end' && styles.alignEnd,
        muted && styles.muted,
        className,
      )}
      {...props}
    />
  );
}
