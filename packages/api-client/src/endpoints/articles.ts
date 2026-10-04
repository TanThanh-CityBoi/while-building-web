import type {
  ApiResponse,
  Article,
  ArticleSummary,
  ListArticlesParams,
  PaginatedResponse,
} from '@while-building/types';
import type { HttpClient } from '../http';

interface CallOptions {
  signal?: AbortSignal;
}

/** Published articles, for the public site. No session needed. */
export function createArticlesApi(http: HttpClient) {
  return {
    /** `GET /articles` — newest first. */
    list(params: ListArticlesParams = {}, { signal }: CallOptions = {}) {
      return http.request<PaginatedResponse<ArticleSummary>>('/articles', {
        query: { ...params },
        signal,
      });
    },

    /** `GET /articles/:slug` — rejects with a 404 `ApiError` for drafts and unknown slugs. */
    async get(slug: string, { signal }: CallOptions = {}): Promise<Article> {
      const path = `/articles/${encodeURIComponent(slug)}`;
      return (await http.request<ApiResponse<Article>>(path, { signal })).data;
    },
  };
}

export type ArticlesApi = ReturnType<typeof createArticlesApi>;
