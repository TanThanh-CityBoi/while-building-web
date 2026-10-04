import type { Permission } from '@while-building/types';
import { buttonVariants } from '@while-building/ui/components/button';
import { LockIcon } from 'lucide-react';
import { Link } from 'react-router';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Page } from './Page';
import { EmptyState } from './States';

/** Shown in place of a page the user isn't allowed to see (UX only — the API enforces access). */
export function ForbiddenState({ permission }: { permission?: Permission }) {
  useDocumentTitle('No access');

  return (
    <Page>
      <EmptyState
        icon={<LockIcon />}
        title="You don't have access to this page"
        description={
          permission ? (
            <>
              It requires the <code className="font-mono">{permission}</code> permission. Ask an
              administrator if you need it.
            </>
          ) : (
            'Ask an administrator if you need access.'
          )
        }
        action={
          <Link to="/dashboard" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Go to dashboard
          </Link>
        }
      />
    </Page>
  );
}
