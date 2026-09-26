import { Link, type LinkProps } from 'react-router';
import { cx } from '@/lib/cx';
import styles from './ButtonLink.module.css';

interface ButtonLinkProps extends LinkProps {
  variant?: 'primary' | 'secondary' | 'text';
}

/** An internal router link styled as a button (or as an arrow-style text link). */
export function ButtonLink({ variant = 'primary', className, ...props }: ButtonLinkProps) {
  return <Link className={cx(styles.base, styles[variant], className)} {...props} />;
}
