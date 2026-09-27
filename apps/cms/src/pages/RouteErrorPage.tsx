import { ErrorState, PageContainer } from '@while-building/ui';

/** Rendered inside the app shell when a page throws while rendering. */
export function RouteErrorPage() {
  return (
    <PageContainer>
      <ErrorState
        title="Something broke on this page"
        description="An unexpected error occurred while rendering it. Try reloading."
        onRetry={() => window.location.reload()}
        retryLabel="Reload page"
      />
    </PageContainer>
  );
}
