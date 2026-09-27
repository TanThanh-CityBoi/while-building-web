import { useMutation } from '@tanstack/react-query';
import { getErrorMessage, isApiError } from '@while-building/api-client';
import type { LoginCredentials } from '@while-building/types';
import { Alert, Badge, Button, FormField, Input } from '@while-building/ui';
import { isValidEmail } from '@while-building/utils';
import { useState, type FormEvent } from 'react';
import { useAuth } from '@/auth/useAuth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import styles from './LoginPage.module.css';

type FormErrors = Partial<Record<keyof LoginCredentials, string>>;

function validate({ email, password }: LoginCredentials): FormErrors {
  const errors: FormErrors = {};
  if (!email.trim()) errors.email = 'Enter your email address.';
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address.';
  if (!password) errors.password = 'Enter your password.';
  return errors;
}

function loginErrorMessage(error: unknown): string {
  if (isApiError(error) && error.kind === 'http') {
    if (error.status === 401) return 'Incorrect email or password.';
    if (error.status === 429) return 'Too many sign-in attempts. Wait a moment and try again.';
  }
  return getErrorMessage(error);
}

export function LoginPage() {
  useDocumentTitle('Sign in');
  const { login, signOutReason } = useAuth();

  const [values, setValues] = useState<LoginCredentials>({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  // On success the auth state changes and <RedirectIfAuthenticated> navigates away.
  const signIn = useMutation({ mutationFn: login });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      (event.currentTarget.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
      return;
    }
    signIn.mutate({ email: values.email.trim(), password: values.password });
  };

  return (
    <main className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.brand}>
          <span className={styles.prompt} aria-hidden="true">
            &gt;_
          </span>
          While Building
          <Badge tone="accent">CMS</Badge>
        </div>

        <div className={styles.card}>
          <div className={styles.heading}>
            <h1 className={styles.title}>Sign in</h1>
            <p className={styles.subtitle}>Use your While Building account.</p>
          </div>

          {signOutReason === 'expired' && !signIn.isError && (
            <Alert tone="warning">Your session has expired. Please sign in again.</Alert>
          )}
          {signOutReason === 'logout-incomplete' && !signIn.isError && (
            <Alert tone="warning">
              You’ve been signed out on this device, but the server couldn’t be reached to end the
              session.
            </Alert>
          )}
          {signIn.isError && <Alert tone="danger">{loginErrorMessage(signIn.error)}</Alert>}

          <form noValidate onSubmit={onSubmit} className={styles.form}>
            <FormField label="Email" error={errors.email}>
              {(field) => (
                <Input
                  {...field}
                  name="email"
                  type="email"
                  autoComplete="username"
                  autoFocus
                  value={values.email}
                  onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                />
              )}
            </FormField>
            <FormField label="Password" error={errors.password}>
              {(field) => (
                <Input
                  {...field}
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={values.password}
                  onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
                />
              )}
            </FormField>
            <Button type="submit" loading={signIn.isPending} className={styles.submit}>
              {signIn.isPending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>

        <p className={styles.footnote}>Accounts are created by an administrator.</p>
      </div>
    </main>
  );
}
