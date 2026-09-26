import { ArticleList } from '@/components/ArticleCard';
import { Container } from '@/components/Container';
import { PageHeader } from '@/components/PageHeader';
import { articles } from '@/data/articles';
import { usePageMeta } from '@/hooks/usePageMeta';

const description =
  'Notes on things I build, learn and break — backend, DevOps, Kubernetes and the homelab.';

export function ArticlesPage() {
  usePageMeta({ title: 'Articles', description });

  return (
    <Container>
      <PageHeader eyebrow="~/articles" title="Articles" description={description} />
      <ArticleList articles={articles} headingLevel="h2" />
    </Container>
  );
}
