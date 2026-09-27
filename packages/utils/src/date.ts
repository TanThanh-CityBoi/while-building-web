type DateInput = string | number | Date;

const toDate = (value: DateInput): Date => (value instanceof Date ? value : new Date(value));

const dateFormatter = new Intl.DateTimeFormat('en', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  // Date-only ISO strings (`2026-09-12`) parse as UTC midnight; format in UTC so the day never shifts.
  timeZone: 'UTC',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

const RELATIVE_UNITS: ReadonlyArray<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 60 * 60 * 24 * 365],
  ['month', 60 * 60 * 24 * 30],
  ['week', 60 * 60 * 24 * 7],
  ['day', 60 * 60 * 24],
  ['hour', 60 * 60],
  ['minute', 60],
];

/** `Sep 12, 2026` — calendar date, stable across time zones. */
export function formatDate(value: DateInput): string {
  return dateFormatter.format(toDate(value));
}

/** `Sep 12, 2026, 02:30 PM` — in the viewer's local time zone. */
export function formatDateTime(value: DateInput): string {
  return dateTimeFormatter.format(toDate(value));
}

/** `3 days ago`, `yesterday`, `in 2 hours`, or `just now` for anything under 45 seconds. */
export function formatRelativeTime(value: DateInput, now: Date = new Date()): string {
  const diffSeconds = (toDate(value).getTime() - now.getTime()) / 1000;
  const absSeconds = Math.abs(diffSeconds);

  if (absSeconds < 45) return 'just now';

  const [unit, unitSeconds] =
    RELATIVE_UNITS.find(([, seconds]) => absSeconds >= seconds) ?? RELATIVE_UNITS.at(-1)!;

  return relativeFormatter.format(Math.round(diffSeconds / unitSeconds), unit);
}
