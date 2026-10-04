import type { TextareaHTMLAttributes } from 'react';
import { cx } from '@while-building/utils';
import styles from './Control.module.css';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return <textarea className={cx(styles.control, styles.textarea, className)} {...props} />;
}
