export function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

/** Joins a base URL and a path with exactly one slash: `joinUrl('http://x/', '/a')` → `http://x/a`. */
export function joinUrl(base: string, path: string): string {
  return `${trimTrailingSlash(base)}/${path.replace(/^\/+/, '')}`;
}

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

/** Builds `?a=1&b=two`, skipping `undefined`, `null` and empty strings. Returns `''` when empty. */
export function toQueryString(params: QueryParams = {}): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}
