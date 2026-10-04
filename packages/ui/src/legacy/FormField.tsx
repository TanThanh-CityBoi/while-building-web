import { useId, type ReactNode } from 'react';
import { cx } from '@while-building/utils';
import styles from './FormField.module.css';

/** Props to spread onto the field's control so label, hint and error are wired up. */
export interface FieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  'aria-required'?: true;
}

export interface FormFieldProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  required?: boolean;
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
}

/**
 * Label + control + hint + error with correct ids and ARIA.
 *
 * ```tsx
 * <FormField label="Email" error={errors.email}>
 *   {(field) => <Input type="email" {...field} />}
 * </FormField>
 * ```
 */
export function FormField({ label, hint, error, required, className, children }: FormFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');

  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children({
        id,
        'aria-describedby': describedBy || undefined,
        'aria-invalid': error ? true : undefined,
        'aria-required': required ? true : undefined,
      })}
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
