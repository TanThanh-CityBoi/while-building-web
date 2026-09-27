import type { ContentStatus } from '@while-building/types';
import {
  Card,
  CardHeader,
  ErrorState,
  LoadingState,
  PageContainer,
  PageHeader,
  buttonClassName,
} from '@while-building/ui';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useContentArticles, useContentProjects } from './queries';
import { contentStatusLabel } from './status';
import styles from './ContentOverviewPage.module.css';

const STATUSES: ContentStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

function countByStatus(items: Array<{ status: ContentStatus }>) {
  return STATUSES.map((status) => ({
    status,
    count: items.filter((item) => item.status === status).length,
  }));
}

interface SectionCardProps {
  title: string;
  description: string;
  to: string;
  query: ReturnType<typeof useContentArticles> | ReturnType<typeof useContentProjects>;
}

function SectionCard({ title, description, to, query }: SectionCardProps) {
  let body: ReactNode;
  if (query.isPending) body = <LoadingState />;
  else if (query.isError) body = <ErrorState onRetry={() => void query.refetch()} />;
  else {
    body = (
      <dl className={styles.stats}>
        <div>
          <dt>Total</dt>
          <dd>{query.data.length}</dd>
        </div>
        {countByStatus(query.data).map(({ status, count }) => (
          <div key={status}>
            <dt>{contentStatusLabel[status]}</dt>
            <dd>{count}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <Card>
      <CardHeader
        title={title}
        description={description}
        actions={
          <Link to={to} className={buttonClassName({ variant: 'secondary', size: 'sm' })}>
            Manage {title.toLowerCase()}
          </Link>
        }
      />
      {body}
    </Card>
  );
}

export function ContentOverviewPage() {
  useDocumentTitle('Content');
  const articles = useContentArticles();
  const projects = useContentProjects();

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Content"
        title="Content"
        description="Everything that appears on the public While Building site."
      />
      <div className={styles.grid}>
        <SectionCard
          title="Articles"
          description="Technical articles and engineering notes."
          to="/content/articles"
          query={articles}
        />
        <SectionCard
          title="Projects"
          description="Side projects, experiments and prototypes."
          to="/content/projects"
          query={projects}
        />
      </div>
    </PageContainer>
  );
}
