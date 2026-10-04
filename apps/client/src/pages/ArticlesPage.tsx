import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageContainer,
  PageHeader,
} from '@while-building/ui';
import { ArticleList } from '@/components/ArticleCard';
import { useArticles } from '@/content/queries';
import { usePageMeta } from '@/hooks/usePageMeta';

const description =
  'Notes on things I build, learn and break — backend, DevOps, Kubernetes and the homelab.';

export function ArticlesPage() {
  usePageMeta({ title: 'Articles', description });
  const articles = useArticles();

  return (
    <PageContainer>
      <PageHeader eyebrow="~/articles" title="Articles" description={description} />
      {articles.isPending ? (
        <LoadingState label="Loading articles…" />
      ) : articles.isError ? (
        <ErrorState title="Couldn't load articles" onRetry={() => void articles.refetch()} />
      ) : articles.data.length === 0 ? (
        <EmptyState title="No articles yet" description="The first write-up is on its way." />
      ) : (
        <ArticleList articles={articles.data} headingLevel="h2" />
      )}
    </PageContainer>
  );
}
