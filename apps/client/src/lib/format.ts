export function formatReadingTime(minutes: number): string {
  return `${Math.max(minutes, 1)} min read`;
}
