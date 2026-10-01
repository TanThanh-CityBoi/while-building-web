import type { Activity } from './useChat';

const TOOL_LABELS: Record<string, string> = {
  search_articles: 'Searching articles…',
  get_article: 'Reading an article…',
  search_projects: 'Searching projects…',
  get_project: 'Reading a project…',
};

/** What to show while the assistant works: thinking, or the lookup it is running. */
export function activityLabel(activity: Activity): string {
  if (activity?.kind === 'tool') return TOOL_LABELS[activity.tool] ?? 'Looking things up…';
  return 'Thinking…';
}
