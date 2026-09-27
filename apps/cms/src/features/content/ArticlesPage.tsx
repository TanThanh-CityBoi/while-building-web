import type { ContentStatus } from '@while-building/types';
import {
  Badge,
  Button,
  Card,
  Dropdown,
  EmptyState,
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
import { formatDate, formatRelativeTime, pluralize } from '@while-building/utils';
import { useState } from 'react';
import { useAuth } from '@/auth/useAuth';
import {
  IconArchive,
  IconArticle,
  IconMore,
  IconPencil,
  IconPlus,
  IconTrash,
  IconUpload,
} from '@/components/icons';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ContentFilters, ContentStatusBadge, NotBuiltYetDialog } from './components';
import { useContentArticles } from './queries';
import styles from './ContentPage.module.css';

export function ArticlesPage() {
  useDocumentTitle('Articles');
  const { can } = useAuth();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ContentStatus | ''>('');
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search.trim());
  const articles = useContentArticles({
    search: debouncedSearch || undefined,
    status: status || undefined,
  });
  const hasFilters = Boolean(search || status);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Content"
        title="Articles"
        description="Write, review and publish technical articles."
        actions={
          <Button
            onClick={() => setPendingAction('New article')}
            disabled={!can('CONTENT_CREATE')}
            title={can('CONTENT_CREATE') ? undefined : 'Requires the CONTENT_CREATE permission'}
          >
            <IconPlus /> New article
          </Button>
        }
      />

      <Card padding="none">
        <ContentFilters
          noun="articles"
          search={search}
          status={status}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          summary={articles.data && pluralize(articles.data.length, 'article')}
        />

        {articles.isPending ? (
          <LoadingState label="Loading articles…" />
        ) : articles.isError ? (
          <ErrorState title="Couldn't load articles" onRetry={() => void articles.refetch()} />
        ) : articles.data.length === 0 ? (
          <EmptyState
            icon={<IconArticle />}
            title={hasFilters ? 'No articles match your filters' : 'No articles yet'}
            description={
              hasFilters ? undefined : 'Drafts and published articles will show up here.'
            }
            action={
              hasFilters && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setStatus('');
                  }}
                >
                  Clear filters
                </Button>
              )
            }
          />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Title</TableHeaderCell>
                  <TableHeaderCell>Category</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Published</TableHeaderCell>
                  <TableHeaderCell>Updated</TableHeaderCell>
                  <TableHeaderCell align="end">
                    <span className="visually-hidden">Actions</span>
                  </TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {articles.data.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <div className={styles.primary}>
                        <span className={styles.title}>{article.title}</span>
                        <span className={styles.slug}>/{article.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell>{article.category}</TableCell>
                    <TableCell>
                      <ContentStatusBadge status={article.status} />
                    </TableCell>
                    <TableCell muted>
                      {article.publishedAt ? formatDate(article.publishedAt) : '—'}
                    </TableCell>
                    <TableCell muted>
                      <time dateTime={article.updatedAt} title={formatDate(article.updatedAt)}>
                        {formatRelativeTime(article.updatedAt)}
                      </time>
                    </TableCell>
                    <TableCell align="end">
                      <div className={styles.actions}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPendingAction(`Edit “${article.title}”`)}
                          disabled={!can('CONTENT_UPDATE')}
                          aria-label={`Edit ${article.title}`}
                        >
                          <IconPencil /> Edit
                        </Button>
                        <Dropdown
                          label={`More actions for ${article.title}`}
                          trigger={<IconMore />}
                          items={[
                            article.status === 'PUBLISHED'
                              ? {
                                  id: 'unpublish',
                                  label: 'Unpublish',
                                  icon: <IconArchive />,
                                  disabled: !can('CONTENT_PUBLISH'),
                                  disabledReason: 'Requires the CONTENT_PUBLISH permission',
                                  onSelect: () => setPendingAction(`Unpublish “${article.title}”`),
                                }
                              : {
                                  id: 'publish',
                                  label: 'Publish',
                                  icon: <IconUpload />,
                                  disabled: !can('CONTENT_PUBLISH'),
                                  disabledReason: 'Requires the CONTENT_PUBLISH permission',
                                  onSelect: () => setPendingAction(`Publish “${article.title}”`),
                                },
                            { id: 'separator', separator: true },
                            {
                              id: 'delete',
                              label: 'Delete',
                              icon: <IconTrash />,
                              tone: 'danger',
                              disabled: !can('CONTENT_DELETE'),
                              disabledReason: 'Requires the CONTENT_DELETE permission',
                              onSelect: () => setPendingAction(`Delete “${article.title}”`),
                            },
                          ]}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <p className={styles.note}>
        <Badge tone="info">Sample data</Badge> Articles come from local sample data until the
        content API exists.
      </p>

      <NotBuiltYetDialog action={pendingAction} onClose={() => setPendingAction(null)} />
    </PageContainer>
  );
}
