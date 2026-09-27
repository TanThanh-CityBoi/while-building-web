import type { Permission } from '@while-building/types';
import { EmptyState, buttonClassName } from '@while-building/ui';
import { Link } from 'react-router';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { IconLock } from './icons';

/** Shown in place of a page the user isn't allowed to see (UX only — the API enforces access). */
export function ForbiddenState({ permission }: { permission?: Permission }) {
  useDocumentTitle('No access');

  return (
    <EmptyState
      icon={<IconLock />}
      title="You don't have access to this page"
      description={
        permission ? (
          <>
            It requires the <code>{permission}</code> permission. Ask an administrator if you need
            it.
          </>
        ) : (
          'Ask an administrator if you need access.'
        )
      }
      action={
        <Link to="/dashboard" className={buttonClassName({ variant: 'secondary', size: 'sm' })}>
          Go to dashboard
        </Link>
      }
    />
  );
}
