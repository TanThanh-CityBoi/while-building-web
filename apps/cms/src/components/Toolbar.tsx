import type { ReactNode } from 'react';
import styles from './Toolbar.module.css';

/** Filter/search row at the top of a table card. */
export function Toolbar({ children, summary }: { children: ReactNode; summary?: ReactNode }) {
  return (
    <div className={styles.toolbar} role="search">
      <div className={styles.controls}>{children}</div>
      {summary && <p className={styles.summary}>{summary}</p>}
    </div>
  );
}
