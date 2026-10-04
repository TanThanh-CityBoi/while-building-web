import type { SelectHTMLAttributes } from 'react';
import { cx } from '@while-building/utils';
import styles from './Control.module.css';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options?: ReadonlyArray<SelectOption>;
  controlSize?: 'sm' | 'md';
}

/** Native select (keeps platform accessibility); pass `options` or `<option>` children. */
export function Select({
  options,
  controlSize = 'md',
  className,
  children,
  ...props
}: SelectProps) {
  return (
    <select
      className={cx(styles.control, styles.select, controlSize === 'sm' && styles.sm, className)}
      {...props}
    >
      {options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
      {children}
    </select>
  );
}
