import { buttonClassName } from '@while-building/ui';
import { cx } from '@while-building/utils';
import { Link, type LinkProps } from 'react-router';
import styles from './ButtonLink.module.css';

interface ButtonLinkProps extends LinkProps {
  /** `primary`/`secondary` use the shared button styles; `text` is the site's mono arrow link. */
  variant?: 'primary' | 'secondary' | 'text';
}

/** An internal router link styled as a button (or as a quiet text link). */
export function ButtonLink({ variant = 'primary', className, ...props }: ButtonLinkProps) {
  const classes =
    variant === 'text' ? cx(styles.text, className) : buttonClassName({ variant, className });
  return <Link className={classes} {...props} />;
}
