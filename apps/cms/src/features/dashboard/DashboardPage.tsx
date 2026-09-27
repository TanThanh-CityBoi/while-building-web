import {
  Badge,
  Card,
  CardHeader,
  ErrorState,
  LoadingState,
  PageContainer,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@while-building/ui';
import { formatDate, formatRelativeTime } from '@while-building/utils';
import { Link } from 'react-router';
import { useAuth } from '@/auth/useAuth';
import { ApiStatus } from '@/components/ApiStatus';
import { ContentStatusBadge } from '@/features/content/components';
import { roleLabel } from '@/features/users/roles';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { api } from '@/lib/api';
import { useDashboardMetrics, useRecentContent } from './queries';
import type { DashboardMetrics } from './source';
import styles from './DashboardPage.module.css';

const METRICS: Array<{ key: keyof DashboardMetrics; label: string; hint: string }> = [
  { key: 'articles', label: 'Articles', hint: 'All statuses' },
  { key: 'projects', label: 'Projects', hint: 'All statuses' },
  { key: 'drafts', label: 'Drafts', hint: 'Articles and projects' },
  { key: 'published', label: 'Published', hint: 'Live on the public site' },
];

export function DashboardPage() {
  useDocumentTitle('Dashboard');
  const { user, can } = useAuth();
  const canReadContent = can('CONTENT_READ');
  const metrics = useDashboardMetrics(canReadContent);
  const recent = useRecentContent(canReadContent);
  const firstName = user?.name.split(' ')[0] ?? 'there';

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${firstName}. Here's the state of While Building.`}
      />

      {canReadContent && (
        <section className={styles.section} aria-labelledby="overview-heading">
          <div className={styles.sectionHeader}>
            <h2 id="overview-heading" className={styles.sectionTitle}>
              Content overview
            </h2>
            <Badge tone="info">Sample data</Badge>
          </div>
          {metrics.isPending ? (
            <LoadingState />
          ) : metrics.isError ? (
            <ErrorState onRetry={() => void metrics.refetch()} />
          ) : (
            <dl className={styles.metrics}>
              {METRICS.map(({ key, label, hint }) => (
                <Card key={key} className={styles.metric}>
                  <dt className={styles.metricLabel}>{label}</dt>
                  <dd className={styles.metricValue}>{metrics.data[key]}</dd>
                  <dd className={styles.metricHint}>{hint}</dd>
                </Card>
              ))}
            </dl>
          )}
        </section>
      )}

      <div className={styles.columns}>
        {canReadContent && (
          <Card padding="none">
            <CardHeader
              title="Recently updated"
              actions={
                <Link to="/content" className={styles.cardLink}>
                  All content →
                </Link>
              }
            />
            {recent.isPending ? (
              <LoadingState />
            ) : recent.isError ? (
              <ErrorState onRetry={() => void recent.refetch()} />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Title</TableHeaderCell>
                      <TableHeaderCell>Type</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell align="end">Updated</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recent.data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Link to={item.href} className={styles.rowLink}>
                            {item.title}
                          </Link>
                        </TableCell>
                        <TableCell muted>{item.type}</TableCell>
                        <TableCell>
                          <ContentStatusBadge status={item.status} />
                        </TableCell>
                        <TableCell muted align="end">
                          <time dateTime={item.updatedAt} title={formatDate(item.updatedAt)}>
                            {formatRelativeTime(item.updatedAt)}
                          </time>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        )}

        <Card>
          <CardHeader title="System" />
          <dl className={styles.facts}>
            <div>
              <dt>API</dt>
              <dd>
                <ApiStatus />
                <code className={styles.url}>{api.baseUrl || 'not configured'}</code>
              </dd>
            </div>
            <div>
              <dt>Signed in as</dt>
              <dd>
                {user?.name} · {user && roleLabel(user.role)}
              </dd>
            </div>
            <div>
              <dt>Permissions</dt>
              <dd>
                <span>
                  {user?.permissions.length ?? 0} granted ·{' '}
                  <Link to="/settings" className={styles.cardLink}>
                    View
                  </Link>
                </span>
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </PageContainer>
  );
}
