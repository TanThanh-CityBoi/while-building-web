import { PageContainer, PageHeader } from '@while-building/ui';
import { ButtonLink } from '@/components/ButtonLink';
import { usePageMeta } from '@/hooks/usePageMeta';

export function NotFoundPage() {
  usePageMeta({ title: 'Page not found' });

  return (
    <PageContainer>
      <PageHeader
        eyebrow="404"
        title="This page hasn't been built yet."
        description="Or it broke. Either way, there's nothing here."
      />
      <ButtonLink to="/">Back to home</ButtonLink>
    </PageContainer>
  );
}
