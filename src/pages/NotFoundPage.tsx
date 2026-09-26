import { ButtonLink } from '@/components/ButtonLink';
import { Container } from '@/components/Container';
import { PageHeader } from '@/components/PageHeader';
import { usePageMeta } from '@/hooks/usePageMeta';

export function NotFoundPage() {
  usePageMeta({ title: 'Page not found' });

  return (
    <Container>
      <PageHeader
        eyebrow="404"
        title="This page hasn't been built yet."
        description="Or it broke. Either way, there's nothing here."
      />
      <ButtonLink to="/">Back to home</ButtonLink>
    </Container>
  );
}
