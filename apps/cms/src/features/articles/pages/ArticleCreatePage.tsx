import type { ArticleContent } from '@while-building/types';
import { Alert, AlertDescription } from '@while-building/ui/components/alert';
import { Button } from '@while-building/ui/components/button';
import { Spinner } from '@while-building/ui/components/spinner';
import { slugify } from '@while-building/utils';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Page } from '@/components/Page';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ArticleForm } from '../components/ArticleForm';
import { UnsavedChangesGuard } from '../components/UnsavedChangesGuard';
import { WorkspaceBar } from '../components/WorkspaceBar';
import { articleErrorMessage, isSlugTaken } from '../errors';
import {
  emptyFormValues,
  hasText,
  isSameForm,
  toCreateInput,
  validateArticle,
  type ArticleFormErrors,
  type ArticleFormValues,
} from '../form';
import { useCreateArticle } from '../hooks/useArticleMutations';
import { useSaveShortcut } from '../hooks/useSaveShortcut';
import { editArticlePath } from '../paths';

const NO_CONTENT: ArticleContent = [];

/** `/content/articles/new` — writes a draft; saving creates it and opens the editor. */
export function ArticleCreatePage() {
  useDocumentTitle('New article');
  const navigate = useNavigate();
  const create = useCreateArticle();
  const [values, setValues] = useState<ArticleFormValues>(emptyFormValues);
  const [errors, setErrors] = useState<ArticleFormErrors>({});
  const [content, setContent] = useState<ArticleContent>(NO_CONTENT);
  // The slug follows the title until the writer edits it.
  const [slugEdited, setSlugEdited] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const leaving = useRef(false);

  const dirty = !isSameForm(values, emptyFormValues) || hasText(content);

  const onChange = (patch: Partial<ArticleFormValues>) => {
    if (patch.slug !== undefined) setSlugEdited(patch.slug !== '');
    setValues((current) => {
      const next = { ...current, ...patch };
      if (patch.title !== undefined && !slugEdited && patch.slug === undefined) {
        next.slug = slugify(patch.title);
      }
      return next;
    });
  };

  const save = async () => {
    const nextErrors = validateArticle(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setFormError(null);
    try {
      const article = await create.mutateAsync(toCreateInput(values, content));
      toast.success('Draft created');
      leaving.current = true;
      void navigate(editArticlePath(article.id), { replace: true });
    } catch (error) {
      if (isSlugTaken(error)) {
        setErrors((current) => ({ ...current, slug: 'Another article already uses this slug.' }));
      } else {
        setFormError(articleErrorMessage(error));
      }
    }
  };

  useSaveShortcut(save);

  return (
    <Page className="max-w-7xl">
      <h1 className="sr-only">New article</h1>
      <WorkspaceBar
        status={dirty ? 'Not saved yet' : 'New draft'}
        actions={
          <Button onClick={() => void save()} disabled={create.isPending}>
            {create.isPending && <Spinner data-icon="inline-start" />}
            Save draft
          </Button>
        }
      />
      {formError && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      <ArticleForm
        values={values}
        errors={errors}
        onChange={onChange}
        initialContent={NO_CONTENT}
        onContentChange={setContent}
      />
      <UnsavedChangesGuard when={dirty} bypass={leaving} />
    </Page>
  );
}
