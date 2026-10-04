/** Up to two initials for avatars: `Ada Lovelace` → `AL`, `ada` → `A`, `` → `?`. */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';

  const first = words[0]!;
  const last = words.length > 1 ? words[words.length - 1]! : '';
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

/** `pluralize(1, 'article')` → `1 article`, `pluralize(3, 'article')` → `3 articles`. */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** Lower-case words separated by single hyphens, e.g. `my-first-k3s-cluster` (the API's rule). */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MAX_LENGTH = 200;

export function isValidSlug(value: string): boolean {
  return value.length <= SLUG_MAX_LENGTH && SLUG_PATTERN.test(value);
}

/**
 * A URL slug from a title, as the API derives it: accents dropped (Vietnamese included),
 * anything else that isn't a letter or digit becomes a hyphen.
 * `Chạy PostgreSQL trên Homelab` → `chay-postgresql-tren-homelab`.
 */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/^-+|-+$/g, '');
}
