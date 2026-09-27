import type { Article } from '@while-building/types';
import { Tag } from '@while-building/ui';
import { formatDate } from '@while-building/utils';
import { Link } from 'react-router';
import { formatReadingTime } from '@/lib/format';
import styles from './ArticleCard.module.css';

type HeadingLevel = 'h2' | 'h3';

interface ArticleCardProps {
  article: Article;
  /** Use `h2` when the list sits directly under the page's `h1`. */
  headingLevel?: HeadingLevel;
}

export function ArticleCard({ article, headingLevel: Heading = 'h3' }: ArticleCardProps) {
  return (
    <article className={styles.card}>
      {article.publishedAt && (
        <time className={styles.date} dateTime={article.publishedAt}>
          {formatDate(article.publishedAt)}
        </time>
      )}
      <div className={styles.body}>
        <Heading className={styles.title}>
          <Link to={`/articles/${article.slug}`} className={styles.link}>
            {article.title}
          </Link>
        </Heading>
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
        <li key={article.id}>
          <ArticleCard article={article} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}
