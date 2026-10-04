import { createContext, lazy, useContext, type ComponentType } from 'react';
import { api } from '@/lib/api';
import type { ArticlesClient } from './api/articles';
import type { ArticleEditorProps } from './components/ArticleEditor';

/**
 * What the articles feature depends on: the API calls and the content editor.
 * Production uses the real client and the BlockNote editor (loaded on demand);
 * tests provide fakes.
 */
export interface ArticlesDependencies {
  client: ArticlesClient;
  Editor: ComponentType<ArticleEditorProps>;
}

export const ArticlesContext = createContext<ArticlesDependencies>({
  client: api.content.articles,
  Editor: lazy(() => import('./components/ArticleEditor')),
});

export function useArticlesDependencies(): ArticlesDependencies {
  return useContext(ArticlesContext);
}
