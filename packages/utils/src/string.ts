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
