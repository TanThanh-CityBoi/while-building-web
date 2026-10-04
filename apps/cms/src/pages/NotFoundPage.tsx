import { buttonVariants } from '@while-building/ui/components/button';
import { InboxIcon } from 'lucide-react';
import { Link } from 'react-router';
import { Page } from '@/components/Page';
import { EmptyState } from '@/components/States';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Not found');
  return (
    <Page>
      <EmptyState
        icon={<InboxIcon />}
        title="Page not found"
        description="This page doesn't exist (yet)."
        action={
          <Link to="/dashboard" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Go to dashboard
          </Link>
        }
      />
    </Page>
  );
}
