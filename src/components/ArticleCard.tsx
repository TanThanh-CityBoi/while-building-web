import { formatDate, formatReadingTime } from '@/lib/format';
import type { Article } from '@/types/content';
import { Tag } from './Tag';
import styles from './ArticleCard.module.css';

type HeadingLevel = 'h2' | 'h3';

interface ArticleCardProps {
  article: Article;
  /** Use `h2` when the list sits directly under the page's `h1`. */
  headingLevel?: HeadingLevel;
}

// No link yet: article detail pages don't exist, so the entry intentionally isn't clickable.
export function ArticleCard({ article, headingLevel: Heading = 'h3' }: ArticleCardProps) {
  return (
    <article className={styles.card}>
      <time className={styles.date} dateTime={article.publishedAt}>
        {formatDate(article.publishedAt)}
      </time>
      <div className={styles.body}>
        <Heading className={styles.title}>{article.title}</Heading>
        <p className={styles.description}>{article.description}</p>
        <div className={styles.meta}>
          <Tag tone="accent">{article.category}</Tag>
          <span>{formatReadingTime(article.readingTimeMinutes)}</span>
        </div>
      </div>
    </article>
  );
}

interface ArticleListProps {
  articles: Article[];
  headingLevel?: HeadingLevel;
}

export function ArticleList({ articles, headingLevel }: ArticleListProps) {
  return (
    <ul role="list" className={styles.list}>
      {articles.map((article) => (
        <li key={article.slug}>
          <ArticleCard article={article} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}
