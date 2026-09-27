import type { ReactNode } from 'react';
import styles from './PageHeader.module.css';

export interface PageHeaderProps {
  title: ReactNode;
  /** Small label above the title (breadcrumb, section, path…). */
  eyebrow?: ReactNode;
  description?: ReactNode;
  /** Buttons or links aligned to the end of the header. */
  actions?: ReactNode;
}

/** The page's `<h1>` block. Size and spacing come from `--page-header-*` tokens. */
export function PageHeader({ title, eyebrow, description, actions }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.text}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
