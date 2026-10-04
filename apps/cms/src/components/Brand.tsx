import { cn } from '@while-building/ui/lib/utils';

/** The ">_ While Building CMS" wordmark. */
export function Brand({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-semibold', className)}>
      <span
        aria-hidden="true"
        className="flex size-7 items-center justify-center rounded-md bg-primary font-mono text-xs text-primary-foreground"
      >
        &gt;_
      </span>
      While Building
      <span className="font-mono text-[0.65rem] tracking-wider text-brand uppercase">CMS</span>
    </span>
  );
}
