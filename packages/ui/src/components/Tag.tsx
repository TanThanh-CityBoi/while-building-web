import type { ReactNode } from 'react';
import { cx } from '@while-building/utils';
import styles from './Tag.module.css';

export interface TagProps {
  children: ReactNode;
  tone?: 'neutral' | 'accent';
}

/** A small mono label for categories and technologies. */
export function Tag({ children, tone = 'neutral' }: TagProps) {
  return <span className={cx(styles.tag, tone === 'accent' && styles.accent)}>{children}</span>;
}

export interface TagListProps {
  items: string[];
  /** Accessible name for the list, e.g. `Technologies`. */
  label?: string;
}

export function TagList({ items, label }: TagListProps) {
  return (
    <ul role="list" aria-label={label} className={styles.list}>
      {items.map((item) => (
        <li key={item}>
          <Tag>{item}</Tag>
        </li>
      ))}
    </ul>
  );
}
