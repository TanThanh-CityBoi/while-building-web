import { Page } from '@/components/Page';
import { ErrorState } from '@/components/States';

/** Rendered inside the app shell when a page throws while rendering. */
export function RouteErrorPage() {
  return (
    <Page>
      <ErrorState
        title="Something broke on this page"
        description="An unexpected error occurred while rendering it. Try reloading."
        onRetry={() => window.location.reload()}
        retryLabel="Reload page"
      />
    </Page>
  );
}
