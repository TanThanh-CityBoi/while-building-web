import { ErrorState, LoadingState, PageContainer, Tag } from '@while-building/ui';
import { formatDate } from '@while-building/utils';
import { lazy, Suspense } from 'react';
import { Link, useParams } from 'react-router';
import { ButtonLink } from '@/components/ButtonLink';
import { useArticle, useArticles } from '@/content/queries';
import { usePageMeta } from '@/hooks/usePageMeta';
import { formatReadingTime } from '@/lib/format';
import { NotFoundPage } from './NotFoundPage';
import styles from './DetailPage.module.css';

// BlockNote is only needed here, so it loads with the first article page.
const ArticleBody = lazy(() => import('@/components/ArticleBody'));

export function ArticleDetailPage() {
  const { slug = '' } = useParams();
  const { data: article, isPending, isError, refetch } = useArticle(slug);
  const { data: articles = [] } = useArticles();
  usePageMeta({
    title: article?.title ?? 'Articles',
    description: article?.excerpt ?? undefined,
    image: article?.coverImage,
    type: article ? 'article' : 'website',
  });

  if (isPending) {
    return (
      <PageContainer>
        <LoadingState label="Loading article…" />
      </PageContainer>
    );
  }
  if (isError) {
    return (
      <PageContainer>
        <ErrorState title="Couldn't load this article" onRetry={() => void refetch()} />
      </PageContainer>
    );
  }
  if (!article) return <NotFoundPage />;

  // `articles` is newest-first: the next item in the list is the older article.
  const index = articles.findIndex((item) => item.id === article.id);
  const newer = index > 0 ? articles[index - 1] : undefined;
  const older = index >= 0 ? articles[index + 1] : undefined;

  return (
    <PageContainer>
      <article className={styles.article}>
        <ButtonLink to="/articles" variant="text" className={styles.back}>
          <span aria-hidden="true">←</span> All articles
        </ButtonLink>

        <header className={styles.header}>
          <div className={styles.meta}>
            {article.category && <Tag tone="accent">{article.category}</Tag>}
            {article.publishedAt && (
              <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            )}
            <span>{formatReadingTime(article.readingTimeMinutes)}</span>
          </div>
          <h1 className={styles.title}>{article.title}</h1>
          {article.excerpt && <p className={styles.lede}>{article.excerpt}</p>}
          {article.author && <p className={styles.byline}>By {article.author.name}</p>}
        </header>

        {article.coverImage && (
          <img src={article.coverImage} alt="" className={styles.cover} decoding="async" />
        )}

        <Suspense fallback={<LoadingState label="Loading article…" />}>
          <ArticleBody content={article.content} />
        </Suspense>

        {(newer || older) && (
          <nav className={styles.pager} aria-label="More articles">
            {older ? (
              <Link to={`/articles/${older.slug}`} className={styles.pagerLink}>
                <span className={styles.pagerLabel}>← Older</span>
                {older.title}
              </Link>
            ) : (
              <span />
            )}
            {newer && (
              <Link to={`/articles/${newer.slug}`} className={`${styles.pagerLink} ${styles.next}`}>
                <span className={styles.pagerLabel}>Newer →</span>
                {newer.title}
              </Link>
            )}
          </nav>
        )}
      </article>
    </PageContainer>
  );
}
