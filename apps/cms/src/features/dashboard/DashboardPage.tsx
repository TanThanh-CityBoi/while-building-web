import { buttonVariants } from '@while-building/ui/components/button';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@while-building/ui/components/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@while-building/ui/components/table';
import { formatDate, formatRelativeTime } from '@while-building/utils';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/auth/useAuth';
import { ApiStatus } from '@/components/ApiStatus';
import { Page, PageHeader } from '@/components/Page';
import { EmptyState, ErrorState, LoadingState } from '@/components/States';
import { ArticleStatusBadge } from '@/features/articles/components/ArticleStatusBadge';
import { useArticles, useArticleStats } from '@/features/articles/hooks/useArticles';
import { editArticlePath } from '@/features/articles/paths';
import { useContentProjects } from '@/features/content/queries';
import { roleLabel } from '@/features/users/roles';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { api } from '@/lib/api';

const RECENT = { page: 1, pageSize: 5, sort: 'updatedAt', order: 'desc' } as const;

function Metric({ label, value, hint }: { label: string; value: ReactNode; hint: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-card p-3 ring-1 ring-foreground/10">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-2xl font-semibold tabular-nums">{value}</dd>
      <dd className="text-xs text-muted-foreground">{hint}</dd>
    </div>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="flex min-w-0 flex-wrap items-center gap-2">{children}</dd>
    </div>
  );
}

export function DashboardPage() {
  useDocumentTitle('Dashboard');
  const { user, can } = useAuth();
  const canReadContent = can('CONTENT_READ');
  const stats = useArticleStats(canReadContent);
  const recent = useArticles(RECENT, canReadContent);
  const projects = useContentProjects();
  const firstName = user?.name.split(' ')[0] ?? 'there';

  return (
    <Page>
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${firstName}. Here's the state of While Building.`}
      />

      {canReadContent && (
        <section aria-labelledby="overview-heading" className="mb-6">
          <h2 id="overview-heading" className="mb-3 text-sm font-medium">
            Content overview
          </h2>
          {stats.isPending ? (
            <LoadingState />
          ) : stats.isError ? (
            <ErrorState onRetry={() => void stats.refetch()} />
          ) : (
            <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Metric label="Articles" value={stats.data.total} hint="All statuses" />
              <Metric
                label="Published"
                value={stats.data.PUBLISHED}
                hint="Live on the public site"
              />
              <Metric label="Drafts" value={stats.data.DRAFT} hint="Not public yet" />
              <Metric
                label="Projects"
                value={projects.data?.length ?? '—'}
                hint="Sample data for now"
              />
            </dl>
          )}
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {canReadContent && (
          <Card className="gap-0 pb-0">
            <CardHeader className="border-b pb-4">
              <CardTitle>
                <h2>Recently updated articles</h2>
              </CardTitle>
              <CardAction>
                <Link
                  to="/content/articles"
                  className={buttonVariants({ variant: 'link', size: 'sm' })}
                >
                  All articles →
                </Link>
              </CardAction>
            </CardHeader>
            {recent.isPending ? (
              <LoadingState />
            ) : recent.isError ? (
              <ErrorState onRetry={() => void recent.refetch()} />
            ) : recent.data.data.length === 0 ? (
              <EmptyState title="No articles yet" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-4 text-right">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.data.data.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="max-w-xs truncate pl-4">
                        <Link
                          to={editArticlePath(article.id)}
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          {article.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <ArticleStatusBadge status={article.status} />
                      </TableCell>
                      <TableCell className="pr-4 text-right text-muted-foreground">
                        <time dateTime={article.updatedAt} title={formatDate(article.updatedAt)}>
                          {formatRelativeTime(article.updatedAt)}
                        </time>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>
              <h2>System</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y">
              <Fact label="API">
                <ApiStatus />
                <code className="truncate font-mono text-xs text-muted-foreground">
                  {api.baseUrl || 'not configured'}
                </code>
              </Fact>
              <Fact label="Signed in as">
                {user?.name} · {user && roleLabel(user.role)}
              </Fact>
              <Fact label="Permissions">
                <span>
                  {user?.permissions.length ?? 0} granted ·{' '}
                  <Link to="/settings" className="underline underline-offset-4">
                    View
                  </Link>
                </span>
              </Fact>
            </dl>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
