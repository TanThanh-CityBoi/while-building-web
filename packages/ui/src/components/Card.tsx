import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cx } from '@while-building/utils';
import styles from './Card.module.css';

export interface CardProps extends ComponentPropsWithoutRef<'div'> {
  /** Use `none` when the card wraps edge-to-edge content such as a table. */
  padding?: 'none' | 'md';
}

export function Card({ padding = 'md', className, ...props }: CardProps) {
  return (
    <div className={cx(styles.card, padding === 'md' && styles.padded, className)} {...props} />
  );
}

export interface CardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  headingLevel?: 'h2' | 'h3';
}

export function CardHeader({
  title,
  description,
  actions,
  headingLevel: Heading = 'h2',
}: CardHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.headerText}>
        <Heading className={styles.title}>{title}</Heading>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
