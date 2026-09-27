import type { InputHTMLAttributes } from 'react';
import { cx } from '@while-building/utils';
import styles from './Control.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  controlSize?: 'sm' | 'md';
}

export function Input({ controlSize = 'md', className, ...props }: InputProps) {
  return (
    <input
      className={cx(styles.control, controlSize === 'sm' && styles.sm, className)}
      {...props}
    />
  );
}
