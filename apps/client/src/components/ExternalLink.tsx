import type { LinkItem } from '@while-building/types';
import styles from './ExternalLink.module.css';

/**
 * Renders an outbound link, or a muted "soon" placeholder when no `href` is set yet.
 * Web links open in a new tab; `mailto:` links don't.
 */
export function ExternalLink({ label, href }: LinkItem) {
  if (!href) {
    return (
      <span className={styles.placeholder}>
        {label} <span className={styles.soon}>(soon)</span>
      </span>
    );
  }

  if (href.startsWith('mailto:')) {
    return (
      <a className={styles.link} href={href}>
        {label}
      </a>
    );
  }

  return (
    <a className={styles.link} href={href} target="_blank" rel="noreferrer">
      {label}
      <span aria-hidden="true">↗</span>
      <span className="visually-hidden">(opens in a new tab)</span>
    </a>
  );
}
