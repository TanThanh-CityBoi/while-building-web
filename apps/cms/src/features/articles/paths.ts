export const articlesPath = '/content/articles';
export const newArticlePath = '/content/articles/new';
export const editArticlePath = (id: string) => `/content/articles/${encodeURIComponent(id)}/edit`;
