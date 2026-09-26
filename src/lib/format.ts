const dateFormatter = new Intl.DateTimeFormat('en', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  // ISO dates like `2026-09-12` parse as UTC midnight; format in UTC so the day never shifts.
  timeZone: 'UTC',
});

export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}
