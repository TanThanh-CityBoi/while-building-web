import { isApiError } from '@while-building/api-client';
import type { ArticleContent, ManagedArticle } from '@while-building/types';
import { Alert, AlertDescription } from '@while-building/ui/components/alert';
import { Button, buttonVariants } from '@while-building/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@while-building/ui/components/dropdown-menu';
import { Spinner } from '@while-building/ui/components/spinner';
import { formatDateTime, formatRelativeTime } from '@while-building/utils';
import {
  EyeOffIcon,
  FileQuestionIcon,
  MoreHorizontalIcon,
  SendIcon,
  Trash2Icon,
} from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '@/auth/useAuth';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Page } from '@/components/Page';
import { EmptyState, ErrorState, LoadingState } from '@/components/States';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ArticleForm } from '../components/ArticleForm';
import { ArticleStatusBadge } from '../components/ArticleStatusBadge';
import { UnsavedChangesGuard } from '../components/UnsavedChangesGuard';
import { WorkspaceBar } from '../components/WorkspaceBar';
import { articleErrorMessage, isSlugTaken } from '../errors';
import {
  hasText,
  isSameForm,
  toFormValues,
  toUpdateInput,
  validateArticle,
  type ArticleFormErrors,
  type ArticleFormValues,
} from '../form';
import { useArticle } from '../hooks/useArticle';
import {
  useDeleteArticle,
  usePublishArticle,
  useUnpublishArticle,
  useUpdateArticle,
} from '../hooks/useArticleMutations';
import { useSaveShortcut } from '../hooks/useSaveShortcut';
import { articlesPath } from '../paths';

/** `/content/articles/:id/edit` */
export function ArticleEditPage() {
  const { id = '' } = useParams();
  const article = useArticle(id);
  useDocumentTitle(article.data?.title || 'Edit article');

  if (article.isPending) {
    return (
      <Page>
        <LoadingState label="Loading the article…" />
      </Page>
    );
  }
  if (article.isError) {
    if (isApiError(article.error) && article.error.status === 404) {
      return (
        <Page>
          <EmptyState
            icon={<FileQuestionIcon />}
            title="Article not found"
            description="It may have been deleted."
            action={
              <Link
                to={articlesPath}
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
              >
                Back to articles
              </Link>
            }
          />
        </Page>
      );
    }
    return (
      <Page>
        <ErrorState
          title="Couldn't load the article"
          description={articleErrorMessage(article.error)}
          onRetry={() => void article.refetch()}
        />
      </Page>
    );
  }
  // Remount for another article so the editor starts from its content.
  return <ArticleEditor key={article.data.id} article={article.data} />;
}

type Dialog = 'publish' | 'unpublish' | 'delete';

function ArticleEditor({ article }: { article: ManagedArticle }) {
  const { can } = useAuth();
  const navigate = useNavigate();
  const canUpdate = can('CONTENT_UPDATE');
  const canPublish = can('CONTENT_PUBLISH');
  const canDelete = can('CONTENT_DELETE');

  // What the API last stored, and what the writer has now.
  const [saved, setSaved] = useState<ArticleFormValues>(() => toFormValues(article));
  const [values, setValues] = useState<ArticleFormValues>(saved);
  // `null` until the body is edited.
  const [content, setContent] = useState<ArticleContent | null>(null);
  const [errors, setErrors] = useState<ArticleFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const leaving = useRef(false);

  const update = useUpdateArticle();
  const publish = usePublishArticle();
  const unpublish = useUnpublishArticle();
  const remove = useDeleteArticle();

  const isPublished = article.status === 'PUBLISHED';
  const dirty = canUpdate && (!isSameForm(values, saved) || content !== null);
  const writable = hasText(content ?? article.content);

  /** Saves pending changes; `false` if they were rejected (errors are on the form). */
  const save = async (): Promise<boolean> => {
    if (!canUpdate) return false;
    const nextErrors = validateArticle(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return false;
    if (!dirty) return true;
    setFormError(null);
    try {
      const updated = await update.mutateAsync({
        id: article.id,
        input: toUpdateInput(values, saved, content),
      });
      const next = toFormValues(updated);
      setSaved(next);
      setValues(next);
      setContent(null);
      return true;
    } catch (error) {
      if (isSlugTaken(error)) {
        setErrors((current) => ({ ...current, slug: 'Another article already uses this slug.' }));
      } else {
        setFormError(articleErrorMessage(error));
      }
      return false;
    }
  };

  const saveWithFeedback = async () => {
    if (!dirty) return;
    if (await save()) toast.success(isPublished ? 'Changes are live' : 'Draft saved');
  };
  useSaveShortcut(saveWithFeedback);

  const confirmPublish = async () => {
    // Never publish stale content: save first.
    if (dirty && !(await save())) {
      throw new Error('Fix the highlighted problems, then publish again.');
    }
    try {
      await publish.mutateAsync(article.id);
    } catch (error) {
      throw new Error(articleErrorMessage(error), { cause: error });
    }
    toast.success('Published');
  };

  const confirmUnpublish = async () => {
    try {
      await unpublish.mutateAsync(article.id);
    } catch (error) {
      throw new Error(articleErrorMessage(error), { cause: error });
    }
    toast.success('Unpublished — the article is a draft again');
  };

  const confirmDelete = async () => {
    try {
      await remove.mutateAsync(article.id);
    } catch (error) {
      throw new Error(articleErrorMessage(error), { cause: error });
    }
    toast.success(`“${article.title}” was deleted`);
    leaving.current = true;
    void navigate(articlesPath, { replace: true });
  };

  const saveState = dirty ? 'Unsaved changes' : `Saved ${formatRelativeTime(article.updatedAt)}`;

  return (
    <Page className="max-w-7xl">
      <h1 className="sr-only">Edit article</h1>
      <WorkspaceBar
        status={
          <>
            <ArticleStatusBadge status={article.status} />
            {canUpdate ? <span aria-live="polite">{saveState}</span> : <span>Read only</span>}
          </>
        }
        actions={
          <>
            {canUpdate && (
              <Button
                variant={isPublished || !canPublish ? 'default' : 'outline'}
                onClick={() => void saveWithFeedback()}
                disabled={!dirty || update.isPending}
              >
                {update.isPending && <Spinner data-icon="inline-start" />}
                {isPublished ? 'Save' : 'Save draft'}
              </Button>
            )}
            {canPublish && !isPublished && (
              <Button
                onClick={() => setDialog('publish')}
                disabled={!writable}
                title={writable ? undefined : 'Write something before publishing.'}
              >
                <SendIcon data-icon="inline-start" /> Publish
              </Button>
            )}
            {((canPublish && isPublished) || canDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" size="icon" aria-label="More actions" />}
                >
                  <MoreHorizontalIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {canPublish && isPublished && (
                    <DropdownMenuItem onClick={() => setDialog('unpublish')}>
                      <EyeOffIcon /> Unpublish
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem variant="destructive" onClick={() => setDialog('delete')}>
                      <Trash2Icon /> Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        }
      />

      {formError && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      {isPublished && canUpdate && (
        <p className="mb-4 text-xs text-muted-foreground">
          This article is live: saving updates the public page right away.
        </p>
      )}

      <ArticleForm
        values={values}
        errors={errors}
        onChange={(patch) => setValues((current) => ({ ...current, ...patch }))}
        initialContent={article.content}
        onContentChange={setContent}
        readOnly={!canUpdate}
        slugHint={
          isPublished
            ? 'Changing it changes the public URL; old links will stop working.'
            : 'The article’s address on the public site.'
        }
        details={<ArticleDetails article={article} />}
      />

      <ConfirmDialog
        open={dialog === 'publish'}
        onClose={() => setDialog(null)}
        title="Publish article?"
        description={
          dirty
            ? 'Your changes will be saved first. The article will then become visible on the public website.'
            : 'This article will become visible on the public website.'
        }
        confirmLabel="Publish"
        onConfirm={confirmPublish}
      />
      <ConfirmDialog
        open={dialog === 'unpublish'}
        onClose={() => setDialog(null)}
        title="Unpublish article?"
        description="The article will no longer be visible on the public website."
        confirmLabel="Unpublish"
        onConfirm={confirmUnpublish}
      />
      <ConfirmDialog
        open={dialog === 'delete'}
        onClose={() => setDialog(null)}
        title="Delete article?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        tone="danger"
        onConfirm={confirmDelete}
      />
      <UnsavedChangesGuard when={dirty} bypass={leaving} />
    </Page>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right">{children}</dd>
    </div>
  );
}

function ArticleDetails({ article }: { article: ManagedArticle }) {
  const time = (value: string) => (
    <time dateTime={value} title={formatDateTime(value)}>
      {formatRelativeTime(value)}
    </time>
  );
  return (
    <dl className="divide-y rounded-lg border px-3 text-xs">
      <Detail label="Author">{article.author?.name ?? '—'}</Detail>
      <Detail label="Created">{time(article.createdAt)}</Detail>
      <Detail label="Updated">{time(article.updatedAt)}</Detail>
      <Detail label="Published">{article.publishedAt ? time(article.publishedAt) : '—'}</Detail>
      <Detail label="Reading time">
        {article.readingTimeMinutes > 0 ? `${article.readingTimeMinutes} min` : '—'}
      </Detail>
    </dl>
  );
}
