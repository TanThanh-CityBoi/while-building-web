import { buttonVariants } from '@while-building/ui/components/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@while-building/ui/components/card';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Page, PageHeader } from '@/components/Page';
import { ErrorState, LoadingState } from '@/components/States';
import { ToneBadge } from '@/components/ToneBadge';
import { useArticleStats } from '@/features/articles/hooks/useArticles';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useContentProjects } from './queries';
import { contentStatusLabel } from './status';

interface Stat {
  label: string;
  value: number;
}

interface SectionCardProps {
  title: string;
  description: string;
  to: string;
  badge?: ReactNode;
  query: { isPending: boolean; isError: boolean; refetch: () => unknown };
  stats: Stat[] | undefined;
}

function SectionCard({ title, description, to, badge, query, stats }: SectionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <h2>{title}</h2>
          {badge}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <Link to={to} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Manage {title.toLowerCase()}
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {query.isPending ? (
          <LoadingState />
        ) : query.isError || !stats ? (
          <ErrorState onRetry={() => void query.refetch()} />
        ) : (
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-4">
            {stats.map(({ label, value }) => (
              <div key={label} className="bg-card px-3 py-2">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="text-xl font-semibold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}

export function ContentOverviewPage() {
  useDocumentTitle('Content');
  const articles = useArticleStats();
  const projects = useContentProjects();

  const articleStats = articles.data && [
    { label: 'Total', value: articles.data.total },
    { label: 'Published', value: articles.data.PUBLISHED },
    { label: 'Drafts', value: articles.data.DRAFT },
  ];
  const projectStats = projects.data && [
    { label: 'Total', value: projects.data.length },
    ...(['PUBLISHED', 'DRAFT', 'ARCHIVED'] as const).map((status) => ({
      label: contentStatusLabel[status],
      value: projects.data.filter((project) => project.status === status).length,
    })),
  ];

  return (
    <Page>
      <PageHeader
        eyebrow="Content"
        title="Content"
        description="Everything that appears on the public While Building site."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Articles"
          description="Technical articles and engineering notes."
          to="/content/articles"
          query={articles}
          stats={articleStats}
        />
        <SectionCard
          title="Projects"
          description="Side projects, experiments and prototypes."
          to="/content/projects"
          badge={<ToneBadge tone="info">Sample data</ToneBadge>}
          query={projects}
          stats={projectStats}
        />
      </div>
    </Page>
  );
}
