import { getErrorMessage } from '@while-building/api-client';
import type { AssignableRole, UpdateUserInput, User } from '@while-building/types';
import {
  Alert,
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  FormField,
  Input,
  Select,
} from '@while-building/ui';
import { isValidEmail, validatePassword } from '@while-building/utils';
import { useState, type FormEvent } from 'react';
import { ASSIGNABLE_ROLES, roleLabel } from './roles';
import { useCreateUser, useUpdateUser } from './queries';

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  /** Edit this user; omit to create a new one. */
  user?: User;
}

interface FormValues {
  name: string;
  email: string;
  role: AssignableRole;
  password: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues = (user?: User): FormValues => ({
  name: user?.name ?? '',
  email: user?.email ?? '',
  role: user && user.role !== 'ROOT' ? user.role : 'AUTHOR',
  password: '',
});

function validate(values: FormValues, isEdit: boolean): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = 'Enter a name.';
  if (!values.email.trim()) errors.email = 'Enter an email address.';
  else if (!isValidEmail(values.email)) errors.email = 'Enter a valid email address.';
  // Creating requires an initial password; editing only validates a new one if given.
  if (!isEdit || values.password) {
    const passwordError = values.password ? validatePassword(values.password) : 'Set a password.';
    if (passwordError) errors.password = passwordError;
  }
  return errors;
}

/** Create a user, or edit name/email/role and optionally reset the password. */
export function UserFormDialog({ open, onClose, user }: UserFormDialogProps) {
  const isEdit = Boolean(user);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit ${user?.name}` : 'New user'}
      description={
        isEdit ? 'Update their details, role or password.' : 'Create an account for the CMS.'
      }
    >
      {/* Remount per user so the form always starts from that user's values. */}
      <UserForm key={user?.id ?? 'new'} user={user} onDone={onClose} />
    </Dialog>
  );
}

function UserForm({ user, onDone }: { user?: User; onDone: () => void }) {
  const isEdit = Boolean(user);
  const [values, setValues] = useState(() => initialValues(user));
  const [errors, setErrors] = useState<FormErrors>({});
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const mutation = isEdit ? updateUser : createUser;

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values, isEdit);
    setErrors(nextErrors);
    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      (event.currentTarget.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
      return;
    }

    const name = values.name.trim();
    const email = values.email.trim();

    if (!user) {
      createUser.mutate(
        { name, email, role: values.role, password: values.password },
        { onSuccess: onDone },
      );
      return;
    }

    // Only send what changed.
    const input: UpdateUserInput = {};
    if (name !== user.name) input.name = name;
    if (email !== user.email) input.email = email;
    if (values.role !== user.role) input.role = values.role;
    if (values.password) input.password = values.password;
    if (Object.keys(input).length === 0) {
      onDone();
      return;
    }
    updateUser.mutate({ id: user.id, input }, { onSuccess: onDone });
  };

  const selectedRole = ASSIGNABLE_ROLES.find((role) => role.value === values.role);

  return (
    <form noValidate onSubmit={onSubmit}>
      <DialogBody>
        {mutation.isError && <Alert tone="danger">{getErrorMessage(mutation.error)}</Alert>}

        <FormField label="Name" error={errors.name} required>
          {(field) => (
            <Input
              {...field}
              name="name"
              autoComplete="off"
              value={values.name}
              onChange={(e) => set('name', e.target.value)}
            />
          )}
        </FormField>

        <FormField label="Email" error={errors.email} required>
          {(field) => (
            <Input
              {...field}
              name="email"
              type="email"
              autoComplete="off"
              value={values.email}
              onChange={(e) => set('email', e.target.value)}
            />
          )}
        </FormField>

        <FormField
          label="Role"
          hint={`${selectedRole?.description ?? ''} Permissions are enforced by the API.`}
        >
          {(field) => (
            <Select
              {...field}
              name="role"
              value={values.role}
              onChange={(e) => set('role', e.target.value as AssignableRole)}
              options={ASSIGNABLE_ROLES.map((role) => ({
                value: role.value,
                label: roleLabel(role.value),
              }))}
            />
          )}
        </FormField>

        <FormField
          label={isEdit ? 'New password' : 'Password'}
          hint={isEdit ? 'Leave blank to keep the current password.' : 'At least 8 characters.'}
          error={errors.password}
          required={!isEdit}
        >
          {(field) => (
            <Input
              {...field}
              name="password"
              type="password"
              autoComplete="new-password"
              value={values.password}
              onChange={(e) => set('password', e.target.value)}
            />
          )}
        </FormField>
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onDone} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button type="submit" loading={mutation.isPending}>
          {isEdit ? 'Save changes' : 'Create user'}
        </Button>
      </DialogFooter>
    </form>
  );
}
