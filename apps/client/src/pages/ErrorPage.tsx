import { PageContainer, PageHeader } from '@while-building/ui';
import { ButtonLink } from '@/components/ButtonLink';
import { usePageMeta } from '@/hooks/usePageMeta';

/** Rendered inside the layout when a route throws while rendering. */
export function ErrorPage() {
  usePageMeta({ title: 'Something broke' });

  return (
    <PageContainer>
      <PageHeader
        eyebrow="error"
        title="Something broke."
        description="An unexpected error occurred while rendering this page. Fitting, for a site about things that break."
      />
      <ButtonLink to="/">Back to home</ButtonLink>
    </PageContainer>
  );
}
