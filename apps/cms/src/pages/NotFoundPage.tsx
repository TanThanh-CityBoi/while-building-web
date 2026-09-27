import { EmptyState, PageContainer, buttonClassName } from '@while-building/ui';
import { Link } from 'react-router';
import { IconInbox } from '@/components/icons';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Not found');
  return (
    <PageContainer>
      <EmptyState
        icon={<IconInbox />}
        title="Page not found"
        description="This page doesn't exist (yet)."
        action={
          <Link to="/dashboard" className={buttonClassName({ variant: 'secondary', size: 'sm' })}>
            Go to dashboard
          </Link>
        }
      />
    </PageContainer>
  );
}
