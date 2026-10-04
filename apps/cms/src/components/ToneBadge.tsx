import { Badge } from '@while-building/ui/components/badge';
import { cn } from '@while-building/ui/lib/utils';
import type { ReactNode } from 'react';

/** Semantic colours for status labels (separate from the brand accent). */
export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand';

const toneClass: Record<Tone, string> = {
  neutral: 'bg-muted text-muted-foreground',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-destructive/10 text-destructive',
  info: 'bg-info/10 text-info',
  brand: 'bg-brand/10 text-brand',
};

interface ToneBadgeProps {
  tone?: Tone;
  /** A leading dot, for live states (API status, account status). */
  dot?: boolean;
  className?: string;
  children: ReactNode;
}

export function ToneBadge({ tone = 'neutral', dot = false, className, children }: ToneBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn('border-transparent font-medium', toneClass[tone], className)}
    >
      {dot && <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />}
      {children}
    </Badge>
  );
}
