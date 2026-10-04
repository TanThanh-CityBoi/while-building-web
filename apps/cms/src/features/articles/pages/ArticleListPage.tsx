import type { ArticleSortField, ArticleStatus, ManagedArticleSummary } from '@while-building/types';
import { Button, buttonVariants } from '@while-building/ui/components/button';
import { Card } from '@while-building/ui/components/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@while-building/ui/components/dropdown-menu';
import { NativeSelect, NativeSelectOption } from '@while-building/ui/components/native-select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@while-building/ui/components/table';
import { formatDate, formatRelativeTime, pluralize } from '@while-building/utils';
import {
  EyeOffIcon,
  FileTextIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SendIcon,
  Trash2Icon,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '@/auth/useAuth';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Page, PageHeader } from '@/components/Page';
import { Pagination } from '@/components/Pagination';
import { EmptyState, ErrorState, LoadingState } from '@/components/States';
import { ContentFilters } from '@/features/content/components';
import { articleStatusOptions } from '@/features/content/status';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ArticleStatusBadge } from '../components/ArticleStatusBadge';
import { articleErrorMessage } from '../errors';
import { useArticles } from '../hooks/useArticles';
import {
  useDeleteArticle,
  usePublishArticle,
  useUnpublishArticle,
} from '../hooks/useArticleMutations';
import { editArticlePath, newArticlePath } from '../paths';

const PAGE_SIZE = 20;

const SORTS: Array<{ value: ArticleSortField; label: string; order: 'asc' | 'desc' }> = [
  { value: 'updatedAt', label: 'Last updated', order: 'desc' },
  { value: 'createdAt', label: 'Newest', order: 'desc' },
  { value: 'publishedAt', label: 'Last published', order: 'desc' },
  { value: 'title', label: 'Title A–Z', order: 'asc' },
];

type PendingAction = { type: 'publish' | 'unpublish' | 'delete'; article: ManagedArticleSummary };

function When({ value }: { value: string | null }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  return (
    <time dateTime={value} title={formatDate(value)}>
      {formatRelativeTime(value)}
    </time>
  );
}

export function ArticleListPage() {
  useDocumentTitle('Articles');
  const { can } = useAuth();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ArticleStatus | ''>('');
  const [sort, setSort] = useState<ArticleSortField>('updatedAt');
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<PendingAction | null>(null);

  const debouncedSearch = useDebouncedValue(search.trim());
  const order = SORTS.find((option) => option.value === sort)?.order ?? 'desc';
  const articles = useArticles({
    search: debouncedSearch || undefined,
    status: status || undefined,
    sort,
    order,
    page,
    pageSize: PAGE_SIZE,
  });
  const publish = usePublishArticle();
  const unpublish = useUnpublishArticle();
  const remove = useDeleteArticle();

  const canCreate = can('CONTENT_CREATE');
  const canUpdate = can('CONTENT_UPDATE');
  const canPublish = can('CONTENT_PUBLISH');
  const canDelete = can('CONTENT_DELETE');
  const hasFilters = Boolean(search || status);

  const resetPage =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };
  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setPage(1);
  };

  const confirmAction = async () => {
    if (!action) return;
    const { article } = action;
    try {
      if (action.type === 'publish') {
        await publish.mutateAsync(article.id);
        toast.success(`“${article.title}” is live`);
      } else if (action.type === 'unpublish') {
        await unpublish.mutateAsync(article.id);
        toast.success(`“${article.title}” is a draft again`);
      } else {
        await remove.mutateAsync(article.id);
        toast.success(`“${article.title}” was deleted`);
      }
    } catch (error) {
      // Shown inside the dialog, which stays open.
      throw new Error(articleErrorMessage(error), { cause: error });
    }
  };

  return (
    <Page>
      <PageHeader
        eyebrow="Content"
        title="Articles"
        description="Write, publish and maintain the articles on the public site."
        actions={
          canCreate && (
            <Link to={newArticlePath} className={buttonVariants()}>
              <PlusIcon data-icon="inline-start" /> New article
            </Link>
          )
        }
      />

      <Card className="gap-0 py-0">
        <ContentFilters
          noun="articles"
          search={search}
          status={status}
          statusOptions={articleStatusOptions}
          onSearchChange={resetPage(setSearch)}
          onStatusChange={resetPage(setStatus)}
          summary={articles.data && pluralize(articles.data.meta.total, 'article')}
          extra={
            <NativeSelect
              aria-label="Sort articles"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as ArticleSortField);
                setPage(1);
              }}
            >
              {SORTS.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          }
        />

        {articles.isPending ? (
          <LoadingState label="Loading articles…" />
        ) : articles.isError ? (
          <ErrorState
            title="Couldn't load articles"
            description={articleErrorMessage(articles.error)}
            onRetry={() => void articles.refetch()}
          />
        ) : articles.data.data.length === 0 ? (
          <EmptyState
            icon={<FileTextIcon />}
            title={hasFilters ? 'No articles match your filters' : 'No articles yet'}
            description={
              hasFilters ? undefined : 'Start a draft; it stays private until you publish it.'
            }
            action={
              hasFilters ? (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : (
                canCreate && (
                  <Link to={newArticlePath} className={buttonVariants({ size: 'sm' })}>
                    <PlusIcon data-icon="inline-start" /> Write the first article
                  </Link>
                )
              )
            }
          />
        ) : (
          <>
            <Table aria-busy={articles.isFetching}>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Author</TableHead>
                  <TableHead className="hidden sm:table-cell">Updated</TableHead>
                  <TableHead className="hidden md:table-cell">Published</TableHead>
                  <TableHead className="pr-4 text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.data.data.map((article) => {
                  const canToggle = canPublish;
                  const hasMenu = canToggle || canDelete;
                  return (
                    <TableRow key={article.id}>
                      <TableCell className="max-w-[12rem] pl-4 whitespace-normal sm:max-w-md">
                        <Link
                          to={editArticlePath(article.id)}
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          {article.title}
                        </Link>
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          /{article.slug}
                        </p>
                      </TableCell>
                      <TableCell>
                        <ArticleStatusBadge status={article.status} />
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {article.author?.name ?? '—'}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">
                        <When value={article.updatedAt} />
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        <When value={article.publishedAt} />
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex justify-end gap-1">
                          <Link
                            to={editArticlePath(article.id)}
                            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                            aria-label={`${canUpdate ? 'Edit' : 'Open'} ${article.title}`}
                          >
                            <PencilIcon data-icon="inline-start" />
                            {canUpdate ? 'Edit' : 'Open'}
                          </Link>
                          {hasMenu && (
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label={`More actions for ${article.title}`}
                                  />
                                }
                              >
                                <MoreHorizontalIcon />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                {canToggle &&
                                  (article.status === 'PUBLISHED' ? (
                                    <DropdownMenuItem
                                      onClick={() => setAction({ type: 'unpublish', article })}
                                    >
                                      <EyeOffIcon /> Unpublish
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={() => setAction({ type: 'publish', article })}
                                    >
                                      <SendIcon /> Publish
                                    </DropdownMenuItem>
                                  ))}
                                {canToggle && canDelete && <DropdownMenuSeparator />}
                                {canDelete && (
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => setAction({ type: 'delete', article })}
                                  >
                                    <Trash2Icon /> Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {articles.data.meta.totalPages > 1 && (
              <Pagination
                meta={articles.data.meta}
                onPageChange={setPage}
                disabled={articles.isFetching}
              />
            )}
          </>
        )}
      </Card>

      <ConfirmDialog
        open={action?.type === 'publish'}
        onClose={() => setAction(null)}
        title="Publish article?"
        description="This article will become visible on the public website."
        confirmLabel="Publish"
        onConfirm={confirmAction}
      />
      <ConfirmDialog
        open={action?.type === 'unpublish'}
        onClose={() => setAction(null)}
        title="Unpublish article?"
        description="The article will no longer be visible on the public website."
        confirmLabel="Unpublish"
        onConfirm={confirmAction}
      />
      <ConfirmDialog
        open={action?.type === 'delete'}
        onClose={() => setAction(null)}
        title="Delete article?"
        description={`“${action?.article.title ?? ''}” will be deleted. This action cannot be undone.`}
        confirmLabel="Delete"
        tone="danger"
        onConfirm={confirmAction}
      />
    </Page>
  );
}
