import { cx, getInitials } from '@while-building/utils';
import styles from './Avatar.module.css';

export interface AvatarProps {
  name: string;
  size?: 'sm' | 'md';
  /** Set when the name is already visible next to the avatar. */
  decorative?: boolean;
  className?: string;
}

/** Initials avatar. (Image avatars can be added once users have profile pictures.) */
export function Avatar({ name, size = 'md', decorative = false, className }: AvatarProps) {
  return (
    <span
      className={cx(styles.avatar, styles[size], className)}
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': name })}
    >
      {getInitials(name)}
    </span>
  );
}
