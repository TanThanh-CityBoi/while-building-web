import { useId, type ReactNode } from 'react';
import { ButtonLink } from './ButtonLink';
import styles from './Section.module.css';

interface SectionProps {
  title: string;
  description?: string;
  /** Optional "see all" style link shown next to the title. */
  action?: { to: string; label: string };
  children: ReactNode;
}

export function Section({ title, description, action, children }: SectionProps) {
  const titleId = useId();

  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        {action && (
          <ButtonLink to={action.to} variant="text">
            {action.label} <span aria-hidden="true">→</span>
          </ButtonLink>
        )}
      </div>
      {children}
    </section>
  );
}
