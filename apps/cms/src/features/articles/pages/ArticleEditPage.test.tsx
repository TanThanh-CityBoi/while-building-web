import { screen, waitFor, within } from '@testing-library/react';
import { ApiError } from '@while-building/api-client';
import { describe, expect, it } from 'vitest';
import { createFakeClient, makeArticle, paragraph, renderArticles } from '@/test/articles-harness';

const editPath = '/content/articles/a1/edit';
/** The status badge in the editor's top bar. */
const status = (label: 'Draft' | 'Published') =>
  screen.findByText(label, { selector: '[data-slot="badge"]' });

describe('ArticleEditPage', () => {
  it('loads the article into the form', async () => {
    renderArticles(editPath);

    expect(
      ((await screen.findByRole('textbox', { name: 'Title' })) as HTMLTextAreaElement).value,
    ).toBe('Running PostgreSQL on my Homelab');
    expect((screen.getByRole('textbox', { name: 'Slug' }) as HTMLInputElement).value).toBe(
      'running-postgresql-on-my-homelab',
    );
    expect(
      (screen.getByRole('textbox', { name: 'Article content' }) as HTMLTextAreaElement).value,
    ).toBe('A database in my living room.');
    expect(await status('Draft')).toBeTruthy();
    expect(screen.getByText('Ada Lovelace')).toBeTruthy();
  });

  it('saves only what changed, then reports it saved', async () => {
    const { client, user } = renderArticles(editPath);
    const title = await screen.findByRole('textbox', { name: 'Title' });
    const save = screen.getByRole('button', { name: 'Save draft' }) as HTMLButtonElement;
    expect(save.disabled).toBe(true);

    await user.clear(title);
    await user.type(title, 'Postgres at Home');
    expect(screen.getByText('Unsaved changes')).toBeTruthy();
    await user.click(save);

    await waitFor(() =>
      expect(client.update).toHaveBeenCalledWith('a1', { title: 'Postgres at Home' }),
    );
    await waitFor(() => expect(save.disabled).toBe(true));
    // Renaming keeps the slug.
    expect((screen.getByRole('textbox', { name: 'Slug' }) as HTMLInputElement).value).toBe(
      'running-postgresql-on-my-homelab',
    );
  });

  it('saves unsaved content before publishing', async () => {
    const { client, user } = renderArticles(editPath);
    const content = await screen.findByRole('textbox', { name: 'Article content' });
    await user.type(content, ' More.');

    await user.click(screen.getByRole('button', { name: 'Publish' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(within(dialog).getByText(/Your changes will be saved first/)).toBeTruthy();
    await user.click(within(dialog).getByRole('button', { name: 'Publish' }));

    await waitFor(() => expect(client.publish).toHaveBeenCalledWith('a1'));
    expect(client.update).toHaveBeenCalledWith('a1', {
      content: [paragraph('A database in my living room. More.')],
    });
    expect(client.update.mock.invocationCallOrder[0]!).toBeLessThan(
      client.publish.mock.invocationCallOrder[0]!,
    );
    expect(await status('Published')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy();
  });

  it('shows a taken slug on the slug field', async () => {
    const client = createFakeClient();
    client.update.mockRejectedValueOnce(
      ApiError.fromResponse(409, {
        statusCode: 409,
        message: 'An article with this slug already exists.',
      }),
    );
    const { user } = renderArticles(editPath, { client });
    const slug = await screen.findByRole('textbox', { name: 'Slug' });

    await user.clear(slug);
    await user.type(slug, 'taken');
    await user.click(screen.getByRole('button', { name: 'Save draft' }));

    expect(await screen.findByText('Another article already uses this slug.')).toBeTruthy();
    expect(slug.getAttribute('aria-invalid')).toBe('true');
  });

  it('checks fields before saving', async () => {
    const { client, user } = renderArticles(editPath);
    const title = await screen.findByRole('textbox', { name: 'Title' });
    await user.clear(title);
    await user.click(screen.getByRole('button', { name: 'Save draft' }));

    expect(screen.getByText('Give the article a title.')).toBeTruthy();
    expect(client.update).not.toHaveBeenCalled();
  });

  it('unpublishes a published article after confirmation', async () => {
    const client = createFakeClient([
      makeArticle({ status: 'PUBLISHED', publishedAt: '2026-10-02T09:00:00.000Z' }),
    ]);
    const { user } = renderArticles(editPath, { client });
    await status('Published');

    await user.click(screen.getByRole('button', { name: 'More actions' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Unpublish' }));
    const dialog = await screen.findByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Unpublish' }));

    await waitFor(() => expect(client.unpublish).toHaveBeenCalledWith('a1'));
    expect(await status('Draft')).toBeTruthy();
  });

  it('deletes and returns to the list', async () => {
    const { client, router, user } = renderArticles(editPath);
    await screen.findByRole('textbox', { name: 'Title' });

    await user.click(screen.getByRole('button', { name: 'More actions' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Delete' }),
    );

    await waitFor(() => expect(router.state.location.pathname).toBe('/content/articles'));
    expect(client.remove).toHaveBeenCalledWith('a1');
  });

  it('is read-only without CONTENT_UPDATE, and hides publishing without CONTENT_PUBLISH', async () => {
    renderArticles(editPath, { permissions: ['CONTENT_READ'] });
    const title = (await screen.findByRole('textbox', { name: 'Title' })) as HTMLTextAreaElement;

    expect(title.readOnly).toBe(true);
    expect(screen.getByText('Read only')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Save draft' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Publish' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'More actions' })).toBeNull();
  });

  it('asks before leaving with unsaved changes', async () => {
    const { router, user } = renderArticles(editPath);
    const title = await screen.findByRole('textbox', { name: 'Title' });
    await user.type(title, '!');

    await user.click(screen.getByRole('link', { name: /Articles/ }));
    const dialog = await screen.findByRole('alertdialog');
    expect(within(dialog).getByText('Discard unsaved changes?')).toBeTruthy();
    expect(router.state.location.pathname).toBe(editPath);

    await user.click(within(dialog).getByRole('button', { name: 'Discard changes' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/content/articles'));
  });

  it('says when the article does not exist', async () => {
    renderArticles('/content/articles/missing/edit');
    expect(await screen.findByText('Article not found')).toBeTruthy();
  });
});

describe('ArticleCreatePage', () => {
  it('derives the slug from the title, creates a draft and opens the editor', async () => {
    const { client, router, user } = renderArticles('/content/articles/new');
    const title = await screen.findByRole('textbox', { name: 'Title' });

    await user.type(title, 'Chạy PostgreSQL trên Homelab');
    expect((screen.getByRole('textbox', { name: 'Slug' }) as HTMLInputElement).value).toBe(
      'chay-postgresql-tren-homelab',
    );
    await user.type(screen.getByRole('textbox', { name: 'Article content' }), 'First lines.');
    await user.click(screen.getByRole('button', { name: 'Save draft' }));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/content/articles/new-1/edit'),
    );
    expect(client.create).toHaveBeenCalledWith({
      title: 'Chạy PostgreSQL trên Homelab',
      slug: 'chay-postgresql-tren-homelab',
      excerpt: null,
      category: null,
      coverImage: null,
      content: [paragraph('First lines.')],
    });
  });

  it('keeps a slug the writer typed', async () => {
    const { user } = renderArticles('/content/articles/new');
    const slug = await screen.findByRole('textbox', { name: 'Slug' });
    await user.type(slug, 'my-slug');
    await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Another Title');
    expect((slug as HTMLInputElement).value).toBe('my-slug');
  });
});
