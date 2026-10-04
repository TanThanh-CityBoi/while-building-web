import type {
  ApiResponse,
  CreateArticleInput,
  ListManagedArticlesParams,
  ManagedArticle,
  ManagedArticleSummary,
  PaginatedResponse,
  UpdateArticleInput,
} from '@while-building/types';
import type { HttpClient } from '../http';

interface CallOptions {
  signal?: AbortSignal;
}

const articlePath = (id: string) => `/content/articles/${encodeURIComponent(id)}`;

/** Article management for the CMS. Every call needs the matching CONTENT_* permission. */
export function createContentArticlesApi(http: HttpClient) {
  const send = async (path: string, method: 'POST' | 'PATCH', body?: unknown) =>
    (await http.request<ApiResponse<ManagedArticle>>(path, { method, body })).data;

  return {
    /** `GET /content/articles` — every status, most recently updated first. */
    list(params: ListManagedArticlesParams = {}, { signal }: CallOptions = {}) {
      return http.request<PaginatedResponse<ManagedArticleSummary>>('/content/articles', {
        query: { ...params },
        signal,
      });
    },

    /** `GET /content/articles/:id` — with its content. */
    async get(id: string, { signal }: CallOptions = {}): Promise<ManagedArticle> {
      return (await http.request<ApiResponse<ManagedArticle>>(articlePath(id), { signal })).data;
    },

    /** `POST /content/articles` — a draft by the signed-in user. */
    create(input: CreateArticleInput): Promise<ManagedArticle> {
      return send('/content/articles', 'POST', input);
    },

    /** `PATCH /content/articles/:id` */
    update(id: string, input: UpdateArticleInput): Promise<ManagedArticle> {
      return send(articlePath(id), 'PATCH', input);
    },

    /** `POST /content/articles/:id/publish` */
    publish(id: string): Promise<ManagedArticle> {
      return send(`${articlePath(id)}/publish`, 'POST');
    },

    /** `POST /content/articles/:id/unpublish` — back to draft. */
    unpublish(id: string): Promise<ManagedArticle> {
      return send(`${articlePath(id)}/unpublish`, 'POST');
    },

    /** `DELETE /content/articles/:id` — permanent. */
    async remove(id: string): Promise<void> {
      await http.request<void>(articlePath(id), { method: 'DELETE' });
    },
  };
}

export type ContentArticlesApi = ReturnType<typeof createContentArticlesApi>;
