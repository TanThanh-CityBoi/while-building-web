import { getErrorMessage, isApiError } from '@while-building/api-client';

/** A message for an article API error, worded for the writer. */
export function articleErrorMessage(error: unknown): string {
  if (isApiError(error) && error.kind === 'http') {
    if (error.status === 404) return 'This article no longer exists. It may have been deleted.';
    if (error.status === 403) return "You don't have permission to do that.";
  }
  return getErrorMessage(error);
}

/** The API refused the slug because another article uses it. */
export function isSlugTaken(error: unknown): boolean {
  return (
    isApiError(error) &&
    error.status === 409 &&
    error.messages.some((message) => message.toLowerCase().includes('slug'))
  );
}
