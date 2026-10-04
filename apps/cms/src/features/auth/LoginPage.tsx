import { useMutation } from '@tanstack/react-query';
import { getErrorMessage, isApiError } from '@while-building/api-client';
import type { LoginCredentials } from '@while-building/types';
import { Alert, AlertDescription } from '@while-building/ui/components/alert';
import { Button } from '@while-building/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@while-building/ui/components/card';
import { Input } from '@while-building/ui/components/input';
import { Spinner } from '@while-building/ui/components/spinner';
import { isValidEmail } from '@while-building/utils';
import { useState, type FormEvent } from 'react';
import { useAuth } from '@/auth/useAuth';
import { Brand } from '@/components/Brand';
import { FormField } from '@/components/FormField';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

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
    <main className="grid min-h-svh place-items-center bg-muted/40 px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Brand className="self-center text-base" />

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              <h1>Sign in</h1>
            </CardTitle>
            <CardDescription>Use your While Building account.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {signOutReason === 'expired' && !signIn.isError && (
              <Alert>
                <AlertDescription>Your session has expired. Please sign in again.</AlertDescription>
              </Alert>
            )}
            {signOutReason === 'logout-incomplete' && !signIn.isError && (
              <Alert>
                <AlertDescription>
                  You’ve been signed out on this device, but the server couldn’t be reached to end
                  the session.
                </AlertDescription>
              </Alert>
            )}
            {signIn.isError && (
              <Alert variant="destructive">
                <AlertDescription>{loginErrorMessage(signIn.error)}</AlertDescription>
              </Alert>
            )}

            <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
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
              <Button type="submit" disabled={signIn.isPending} className="w-full">
                {signIn.isPending && <Spinner data-icon="inline-start" />}
                {signIn.isPending ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Accounts are created by an administrator.
        </p>
      </div>
    </main>
  );
}
