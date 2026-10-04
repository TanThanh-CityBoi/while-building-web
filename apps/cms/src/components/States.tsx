import { Button } from '@while-building/ui/components/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@while-building/ui/components/empty';
import { Spinner } from '@while-building/ui/components/spinner';
import { cn } from '@while-building/ui/lib/utils';
import { TriangleAlertIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface LoadingStateProps {
  label?: string;
  /** Fill the viewport (before the app shell exists). */
  fullscreen?: boolean;
  className?: string;
}

/** A quiet spinner that only appears if loading takes a moment. */
export function LoadingState({ label = 'Loading…', fullscreen, className }: LoadingStateProps) {
  return (
    <div
      role="status"
      className={cn(
        'flex animate-in items-center justify-center gap-2 py-16 text-sm text-muted-foreground delay-300 duration-300 fill-mode-both fade-in',
        fullscreen && 'min-h-svh',
        className,
      )}
    >
      <Spinner role="presentation" aria-hidden="true" aria-label={undefined} />
      <span>{label}</span>
    </div>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <Empty className={cn('py-12', className)}>
      <EmptyHeader>
        {icon && <EmptyMedia variant="icon">{icon}</EmptyMedia>}
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  );
}

interface ErrorStateProps {
  title?: ReactNode;
  description?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  /** Extra action next to Retry. */
  action?: ReactNode;
  fullscreen?: boolean;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
  retryLabel = 'Try again',
  action,
  fullscreen,
  className,
}: ErrorStateProps) {
  return (
    <div role="alert" className={cn(fullscreen && 'grid min-h-svh place-items-center', className)}>
      <EmptyState
        icon={<TriangleAlertIcon className="text-destructive" />}
        title={title}
        description={description}
        action={
          (onRetry || action) && (
            <div className="flex flex-wrap justify-center gap-2">
              {onRetry && (
                <Button variant="outline" size="sm" onClick={onRetry}>
                  {retryLabel}
                </Button>
              )}
              {action}
            </div>
          )
        }
      />
    </div>
  );
}
