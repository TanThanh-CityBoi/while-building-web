import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createFakeClient, makeArticle, renderArticles } from '@/test/articles-harness';

const articles = [
  makeArticle({ id: 'a1', title: 'Draft Notes', status: 'DRAFT' }),
  makeArticle({
    id: 'a2',
    title: 'Live Post',
    slug: 'live-post',
    status: 'PUBLISHED',
    publishedAt: '2026-10-02T09:00:00.000Z',
  }),
];

const rowOf = (title: string) => screen.getByRole('link', { name: title }).closest('tr')!;

describe('ArticleListPage', () => {
  it('lists articles with their status, slug and author', async () => {
    renderArticles('/content/articles', { client: createFakeClient(articles) });

    expect(await screen.findByRole('link', { name: 'Draft Notes' })).toBeTruthy();
    expect(within(rowOf('Draft Notes')).getByText('Draft')).toBeTruthy();
    expect(within(rowOf('Live Post')).getByText('Published')).toBeTruthy();
    expect(within(rowOf('Live Post')).getByText('/live-post')).toBeTruthy();
    expect(screen.getByText('2 articles')).toBeTruthy();
    expect(screen.getByRole('link', { name: /New article/ })).toBeTruthy();
  });

  it('asks the API for the chosen status and sort', async () => {
    const { client, user } = renderArticles('/content/articles', {
      client: createFakeClient(articles),
    });
    await screen.findByRole('link', { name: 'Draft Notes' });

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by status' }),
      'PUBLISHED',
    );
    await user.selectOptions(screen.getByRole('combobox', { name: 'Sort articles' }), 'title');

    await waitFor(() =>
      expect(client.list).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: 'PUBLISHED', sort: 'title', order: 'asc', page: 1 }),
        expect.anything(),
      ),
    );
  });

  it('shows only the actions the user may take', async () => {
    renderArticles('/content/articles', {
      client: createFakeClient(articles),
      permissions: ['CONTENT_READ', 'CONTENT_UPDATE'],
    });
    await screen.findByRole('link', { name: 'Draft Notes' });

    expect(screen.queryByRole('link', { name: /New article/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /More actions/ })).toBeNull();
    expect(screen.getByRole('link', { name: 'Edit Draft Notes' })).toBeTruthy();
  });

  it('opens articles read-only without CONTENT_UPDATE', async () => {
    renderArticles('/content/articles', {
      client: createFakeClient(articles),
      permissions: ['CONTENT_READ'],
    });
    expect(await screen.findByRole('link', { name: 'Open Draft Notes' })).toBeTruthy();
  });

  it('publishes after confirmation', async () => {
    const { client, user } = renderArticles('/content/articles', {
      client: createFakeClient(articles),
    });
    await screen.findByRole('link', { name: 'Draft Notes' });

    await user.click(screen.getByRole('button', { name: 'More actions for Draft Notes' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Publish' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(
      within(dialog).getByText('This article will become visible on the public website.'),
    ).toBeTruthy();
    await user.click(within(dialog).getByRole('button', { name: 'Publish' }));

    await waitFor(() => expect(client.publish).toHaveBeenCalledWith('a1'));
    await waitFor(() => expect(within(rowOf('Draft Notes')).getByText('Published')).toBeTruthy());
  });

  it('deletes after confirmation, and keeps the dialog open with the reason on failure', async () => {
    const client = createFakeClient(articles);
    client.remove.mockRejectedValueOnce(new Error('The API is unreachable.'));
    const { user } = renderArticles('/content/articles', { client });
    await screen.findByRole('link', { name: 'Live Post' });

    await user.click(screen.getByRole('button', { name: 'More actions for Live Post' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(within(dialog).getByText(/This action cannot be undone/)).toBeTruthy();

    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
    expect(await within(dialog).findByText('The API is unreachable.')).toBeTruthy();

    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(screen.queryByRole('link', { name: 'Live Post' })).toBeNull());
    expect(client.remove).toHaveBeenCalledTimes(2);
  });

  it('offers to write the first article when there are none', async () => {
    renderArticles('/content/articles', { client: createFakeClient([]) });
    expect(await screen.findByText('No articles yet')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Write the first article/ })).toBeTruthy();
  });
});
